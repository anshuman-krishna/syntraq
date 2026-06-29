import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { apiUsageService } from '../../server/services/apiUsageService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function insertBaseTenant() {
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  sqlite.prepare(
    'INSERT INTO api_keys (id, company_id, name, key_hash, key_prefix, permissions, last_used_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('key_1', 'company_1', 'production', 'hash', 'prefix12', '{}', null, now)
}

// drizzle stores `integer({ mode: 'timestamp' })` as unix seconds, so raw
// inserts (which bypass drizzle's encoder) must use seconds too.
function insertLog(id: string, status: number, responseTime: number, ageMs = 0) {
  const createdAtSeconds = Math.floor((now - ageMs) / 1000)
  sqlite.prepare(
    'INSERT INTO api_usage_logs (id, api_key_id, company_id, method, path, status_code, response_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, 'key_1', 'company_1', 'GET', '/api/public/shifts', status, responseTime, createdAtSeconds)
}

describe.sequential('api usage service against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        name TEXT NOT NULL, key_hash TEXT NOT NULL, key_prefix TEXT NOT NULL,
        permissions TEXT NOT NULL DEFAULT '{}', last_used_at INTEGER, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS api_usage_logs (
        id TEXT PRIMARY KEY, api_key_id TEXT NOT NULL REFERENCES api_keys(id),
        company_id TEXT NOT NULL REFERENCES companies(id), method TEXT NOT NULL,
        path TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER,
        created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec('DELETE FROM api_usage_logs; DELETE FROM api_keys; DELETE FROM companies;')
    insertBaseTenant()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('aggregates totals, status buckets, and average latency', () => {
    insertLog('l1', 200, 100)
    insertLog('l2', 200, 200)
    insertLog('l3', 404, 50)
    insertLog('l4', 500, 300)

    const summary = apiUsageService.summary('company_1', 24)

    expect(summary.totalCalls).toBe(4)
    expect(summary.statusCounts['2xx']).toBe(2)
    expect(summary.statusCounts['4xx']).toBe(1)
    expect(summary.statusCounts['5xx']).toBe(1)
    expect(summary.avgResponseTime).toBe(Math.round((100 + 200 + 50 + 300) / 4))
  })

  it('resolves key names and ranks usage per key', () => {
    insertLog('l1', 200, 100)
    insertLog('l2', 200, 100)

    const summary = apiUsageService.summary('company_1', 24)
    expect(summary.byKey).toEqual([{ keyId: 'key_1', name: 'production', calls: 2 }])
  })

  it('excludes calls outside the requested window', () => {
    insertLog('recent', 200, 100, 1000)
    insertLog('old', 200, 100, 48 * 60 * 60 * 1000)

    const summary = apiUsageService.summary('company_1', 24)
    expect(summary.totalCalls).toBe(1)
  })

  it('scopes usage to the requesting company', () => {
    insertLog('l1', 200, 100)
    expect(apiUsageService.summary('company_2', 24).totalCalls).toBe(0)
  })
})
