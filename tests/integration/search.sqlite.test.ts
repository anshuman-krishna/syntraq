import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { searchService } from '../../server/services/searchService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function seed() {
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_2', 'Other', now)
  sqlite.prepare(
    'INSERT INTO users (id, email, password_hash, name, role, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run('user_1', 'admin@syntraq.io', null, 'Admin', 'admin', 'company_1', now)
  sqlite.prepare(
    'INSERT INTO employees (id, company_id, name, role, email, phone, hire_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('emp_1', 'company_1', 'Dana Holt', 'driver', 'dana@acme.io', '', '2025-01-01', 'active', now)
  sqlite.prepare(
    'INSERT INTO vehicles (id, company_id, name, plate, type, status, mileage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('veh_1', 'company_1', 'Hydrovac 2', 'DANA-1', 'hydrovac', 'available', 0, now)
  sqlite.prepare(
    'INSERT INTO workflows (id, company_id, name, description, steps, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('wf_1', 'company_1', 'Daily inspection', null, '[]', 'active', 'user_1', now, now)
  // foreign company row that must never leak
  sqlite.prepare(
    'INSERT INTO employees (id, company_id, name, role, email, phone, hire_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('emp_2', 'company_2', 'Dana Cross', 'driver', 'dana@other.io', '', '2025-01-01', 'active', now)
}

describe.sequential('search service against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT, name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'operator', company_id TEXT NOT NULL REFERENCES companies(id), created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        role TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '',
        hire_date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        plate TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'available',
        mileage INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        description TEXT, steps TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT NOT NULL REFERENCES users(id), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec('DELETE FROM workflows; DELETE FROM vehicles; DELETE FROM employees; DELETE FROM users; DELETE FROM companies;')
    seed()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('matches across employees, vehicles, and workflows', () => {
    const results = searchService.search('company_1', 'dana')
    const types = results.map(r => r.type).sort()
    expect(types).toEqual(['employee', 'vehicle'])
    expect(results.find(r => r.type === 'employee')?.label).toBe('Dana Holt')
  })

  it('matches workflows by name', () => {
    const results = searchService.search('company_1', 'inspection')
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ type: 'workflow', route: '/workflows' })
  })

  it('ignores queries shorter than two characters', () => {
    expect(searchService.search('company_1', 'd')).toEqual([])
  })

  it('never leaks results from another company', () => {
    const results = searchService.search('company_1', 'dana')
    expect(results.every(r => r.label !== 'Dana Cross')).toBe(true)
  })
})
