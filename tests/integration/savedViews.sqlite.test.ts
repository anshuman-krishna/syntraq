import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { savedViewService } from '../../server/services/savedViewService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function seed() {
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  for (const id of ['user_1', 'user_2']) {
    sqlite.prepare(
      'INSERT INTO users (id, email, password_hash, name, role, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(id, `${id}@syntraq.io`, null, id, 'manager', 'company_1', now)
  }
}

describe.sequential('saved view service against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT, name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'operator', company_id TEXT NOT NULL REFERENCES companies(id), created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS saved_views (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
        company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        filters TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec('DELETE FROM saved_views; DELETE FROM users; DELETE FROM companies;')
    seed()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('creates and lists a view with its filters', () => {
    savedViewService.createView(
      { name: 'my drivers', filters: { filterRole: 'driver', sortDirection: 'asc' } },
      'user_1',
      'company_1',
    )

    const views = savedViewService.list('user_1', 'company_1')
    expect(views).toHaveLength(1)
    expect(views[0]).toMatchObject({ name: 'my drivers', filters: { filterRole: 'driver', sortDirection: 'asc' } })
  })

  it('scopes views to the owning user', () => {
    savedViewService.createView({ name: 'mine', filters: {} }, 'user_1', 'company_1')
    expect(savedViewService.list('user_2', 'company_1')).toHaveLength(0)
  })

  it('removes a view', () => {
    const view = savedViewService.createView({ name: 'temp', filters: {} }, 'user_1', 'company_1')
    savedViewService.removeView(view.id, 'user_1', 'company_1')
    expect(savedViewService.list('user_1', 'company_1')).toHaveLength(0)
  })

  it('will not remove another user\'s view', () => {
    const view = savedViewService.createView({ name: 'mine', filters: {} }, 'user_1', 'company_1')
    expect(() => savedViewService.removeView(view.id, 'user_2', 'company_1')).toThrow('view not found')
  })
})
