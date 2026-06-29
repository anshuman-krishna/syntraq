import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { notificationPreferenceService } from '../../server/services/notificationPreferenceService'
import { notificationService } from '../../server/services/notificationService'

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
    'INSERT INTO users (id, email, password_hash, name, role, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run('user_1', 'admin@syntraq.io', null, 'Admin', 'admin', 'company_1', now)
}

describe.sequential('notification preference service against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT,
        name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'operator',
        company_id TEXT NOT NULL REFERENCES companies(id), created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS notification_preferences (
        user_id TEXT PRIMARY KEY REFERENCES users(id),
        company_id TEXT NOT NULL REFERENCES companies(id),
        preferences TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
        company_id TEXT NOT NULL REFERENCES companies(id), type TEXT NOT NULL,
        title TEXT NOT NULL, message TEXT NOT NULL, metadata TEXT,
        read INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec(`
      DELETE FROM notifications;
      DELETE FROM notification_preferences;
      DELETE FROM users;
      DELETE FROM companies;
    `)
    insertBaseTenant()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('defaults every type to enabled when nothing is stored', () => {
    const { preferences } = notificationPreferenceService.get('user_1')
    expect(Object.values(preferences).every(Boolean)).toBe(true)
    expect(preferences.shift).toBe(true)
  })

  it('persists opt-outs and reflects them in isEnabled', () => {
    notificationPreferenceService.update('user_1', 'company_1', { billing: false, shift: true })
    const { preferences } = notificationPreferenceService.get('user_1')

    expect(preferences.billing).toBe(false)
    expect(preferences.shift).toBe(true)
    expect(notificationPreferenceService.isEnabled('user_1', 'billing')).toBe(false)
    expect(notificationPreferenceService.isEnabled('user_1', 'shift')).toBe(true)
  })

  it('treats an unknown type as enabled', () => {
    notificationPreferenceService.update('user_1', 'company_1', { billing: false })
    expect(notificationPreferenceService.isEnabled('user_1', 'totally-new-type')).toBe(true)
  })

  it('suppresses notifications for opted-out types', () => {
    notificationPreferenceService.update('user_1', 'company_1', { automation: false })

    const suppressed = notificationService.create('user_1', 'company_1', 'automation', 'hi', 'body')
    expect(suppressed).toBeNull()

    const delivered = notificationService.create('user_1', 'company_1', 'shift', 'hi', 'body')
    expect(delivered).not.toBeNull()
  })
})
