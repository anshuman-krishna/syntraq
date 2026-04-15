import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

function resolvePath(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./db.sqlite'
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const sqlite = new Database(resolvePath())
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
