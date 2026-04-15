import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { randomUUID } from 'crypto'
import * as schema from '../../server/db/schema'

// build a fully-migrated in-memory sqlite and return both the drizzle instance
// and a bag of seeded ids so individual tests don't need to re-stitch graph roots.
export function buildTestDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })

  // minimal schema bootstrap: we mirror the ddl that drizzle-kit would emit.
  // keeping this in sync with schema.ts is cheaper than spinning up kit in tests.
  sqlite.exec(`
    CREATE TABLE companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT,
      name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'operator',
      company_id TEXT NOT NULL REFERENCES companies(id),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE password_reset_tokens (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
      token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL,
      used_at INTEGER, created_at INTEGER NOT NULL
    );
    CREATE TABLE user_totp (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      secret TEXT NOT NULL, verified_at INTEGER,
      recovery_codes_hash TEXT, created_at INTEGER NOT NULL
    );
    CREATE TABLE api_keys (
      id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
      name TEXT NOT NULL, key_hash TEXT NOT NULL, key_prefix TEXT NOT NULL,
      permissions TEXT NOT NULL DEFAULT '{}',
      last_used_at INTEGER, created_at INTEGER NOT NULL
    );
  `)

  const companyId = randomUUID()
  const userId = randomUUID()
  const now = Date.now()
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run(companyId, 'acme', now)
  sqlite
    .prepare('INSERT INTO users (id, email, password_hash, name, role, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(userId, 'tester@syntraq.io', null, 'tester', 'admin', companyId, now)

  return { db, sqlite, companyId, userId }
}
