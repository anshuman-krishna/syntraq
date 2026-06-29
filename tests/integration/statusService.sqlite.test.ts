import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { statusService } from '../../server/services/statusService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const sqlite = new Database(resolveDbPath())

describe.sequential('status service against sqlite', () => {
  beforeAll(() => {
    // healthService pings the companies table; a present table means a healthy sample
    sqlite.exec('CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);')
  })

  beforeEach(() => {
    statusService.reset()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('records a healthy sample and reports full uptime', () => {
    const snapshot = statusService.snapshot()
    expect(snapshot.status).toBe('healthy')
    expect(snapshot.uptime).toBe(100)
    expect(snapshot.samples).toHaveLength(1)
  })

  it('does not record a second sample within the throttle window', () => {
    statusService.snapshot()
    const second = statusService.snapshot()
    expect(second.samples).toHaveLength(1)
  })
})
