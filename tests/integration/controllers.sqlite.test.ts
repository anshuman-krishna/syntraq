import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { onboardingController } from '../../server/controllers/onboardingController'
import { replayController } from '../../server/controllers/replayController'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const dbPath = resolveDbPath()
const sqlite = new Database(dbPath)

const adminEvent = {
  context: {
    user: {
      id: 'user_1',
      email: 'admin@syntraq.io',
      name: 'Admin',
      role: 'admin',
      companyId: 'company_1',
    },
  },
} as never

function insertBaseTenant() {
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  sqlite.prepare(
    'INSERT INTO users (id, email, password_hash, name, role, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run('user_1', 'admin@syntraq.io', null, 'Admin', 'admin', 'company_1', now)
}

function readOnboardingRow() {
  return sqlite.prepare('SELECT completed_steps, completed FROM onboarding_progress WHERE user_id = ? AND company_id = ?')
    .get('user_1', 'company_1') as { completed_steps: string; completed: number } | undefined
}

describe.sequential('controller integration against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'operator',
        company_id TEXT NOT NULL REFERENCES companies(id),
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS onboarding_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        company_id TEXT NOT NULL REFERENCES companies(id),
        completed_steps TEXT NOT NULL DEFAULT '[]',
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
      CREATE TABLE IF NOT EXISTS replay_sessions (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL REFERENCES companies(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        user_name TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        route TEXT NOT NULL,
        event_count INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS replay_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES replay_sessions(id),
        company_id TEXT NOT NULL REFERENCES companies(id),
        type TEXT NOT NULL,
        route TEXT NOT NULL,
        action TEXT,
        metadata TEXT,
        timestamp INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec(`
      DELETE FROM replay_events;
      DELETE FROM replay_sessions;
      DELETE FROM onboarding_progress;
      DELETE FROM users;
      DELETE FROM companies;
    `)
    insertBaseTenant()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('initializes onboarding progress through the controller on first read', () => {
    const result = onboardingController.getProgress(adminEvent)

    expect(result.completed).toBe(false)
    expect(result.completedSteps).toEqual([])
    expect(result.steps).toHaveLength(4)
    expect(readOnboardingRow()).toMatchObject({
      completed_steps: '[]',
      completed: 0,
    })
  })

  it('marks onboarding complete through the controller skip flow', async () => {
    onboardingController.getProgress(adminEvent)

    const result = await onboardingController.skip(adminEvent)

    expect(result).toEqual({
      completedSteps: [],
      completed: true,
    })
    expect(readOnboardingRow()).toMatchObject({
      completed: 1,
    })
  })

  it('returns replay sessions and events from sqlite through the controller', () => {
    sqlite.prepare(`
      INSERT INTO replay_sessions
      (id, company_id, user_id, user_name, started_at, ended_at, route, event_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('session_1', 'company_1', 'user_1', 'Admin', now, now + 60000, '/dashboard', 2)
    sqlite.prepare(`
      INSERT INTO replay_events
      (id, session_id, company_id, type, route, action, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('event_2', 'session_1', 'company_1', 'click', '/dashboard', 'open-card', null, now + 2000)
    sqlite.prepare(`
      INSERT INTO replay_events
      (id, session_id, company_id, type, route, action, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('event_1', 'session_1', 'company_1', 'page_visit', '/dashboard', null, null, now + 1000)

    const result = replayController.getSession({
      context: {
        ...adminEvent.context,
        params: { id: 'session_1' },
      },
    } as never)

    expect(result.session).toMatchObject({
      id: 'session_1',
      companyId: 'company_1',
      userId: 'user_1',
      route: '/dashboard',
      eventCount: 2,
    })
    expect(result.events.map(event => event.id)).toEqual(['event_1', 'event_2'])
  })

  it('returns a structured not_found error for missing replay sessions', () => {
    try {
      replayController.getSession({
        context: {
          ...adminEvent.context,
          params: { id: 'missing_session' },
        },
      } as never)
      throw new Error('expected controller to throw')
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 404,
        data: {
          error: {
            code: 'not_found',
            message: 'session not found',
            details: { id: 'missing_session' },
          },
        },
      })
    }
  })
})
