import Database from 'better-sqlite3'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { webhookService } from '../../server/services/webhookService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function insertWebhook(failureCount = 0) {
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  sqlite.prepare(
    'INSERT INTO webhooks (id, company_id, url, event_types, secret, active, last_triggered_at, failure_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('wh_1', 'company_1', 'https://example.com/hook', '["*"]', 'secret', 1, null, failureCount, now)
}

describe.sequential('webhook test ping against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS webhooks (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        url TEXT NOT NULL, event_types TEXT NOT NULL, secret TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1, last_triggered_at INTEGER,
        failure_count INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id TEXT PRIMARY KEY, webhook_id TEXT NOT NULL REFERENCES webhooks(id),
        company_id TEXT NOT NULL REFERENCES companies(id), event_type TEXT NOT NULL,
        status INTEGER NOT NULL, response_time INTEGER, error TEXT, created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec('DELETE FROM webhook_logs; DELETE FROM webhooks; DELETE FROM companies;')
    insertWebhook()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('reports a successful delivery and records a log', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('ok', { status: 200 })))

    const result = await webhookService.testPing('wh_1', 'company_1')
    expect(result.ok).toBe(true)
    expect(result.status).toBe(200)

    const log = sqlite.prepare('SELECT event_type, status FROM webhook_logs WHERE webhook_id = ?').get('wh_1') as
      | { event_type: string; status: number }
      | undefined
    expect(log).toMatchObject({ event_type: 'test.ping', status: 200 })
  })

  it('reports a failed delivery without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('connection refused') }))

    const result = await webhookService.testPing('wh_1', 'company_1')
    expect(result.ok).toBe(false)
    expect(result.status).toBe(0)
    expect(result.error).toContain('connection refused')
  })

  it('does not increment failureCount on a failed test', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('boom') }))

    await webhookService.testPing('wh_1', 'company_1')
    const row = sqlite.prepare('SELECT failure_count FROM webhooks WHERE id = ?').get('wh_1') as { failure_count: number }
    expect(row.failure_count).toBe(0)
  })

  it('throws for an unknown webhook', async () => {
    await expect(webhookService.testPing('missing', 'company_1')).rejects.toThrow('webhook not found')
  })
})
