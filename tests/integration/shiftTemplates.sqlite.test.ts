import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { shiftTemplateService } from '../../server/services/shiftTemplateService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function seed() {
  sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  sqlite.prepare(
    'INSERT INTO users (id, email, password_hash, name, role, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run('user_1', 'admin@syntraq.io', null, 'Admin', 'admin', 'company_1', now)
  sqlite.prepare(
    'INSERT INTO employees (id, company_id, name, role, email, phone, hire_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('emp_1', 'company_1', 'Dana Holt', 'driver', 'dana@acme.io', '', '2025-01-01', 'active', now)
}

describe.sequential('shift template service against sqlite', () => {
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
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        employee_id TEXT NOT NULL REFERENCES employees(id), date TEXT NOT NULL,
        start_time TEXT NOT NULL, end_time TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'scheduled',
        vehicle_id TEXT, notes TEXT, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        type TEXT NOT NULL, description TEXT NOT NULL, employee_id TEXT, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS shift_templates (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        employee_id TEXT NOT NULL REFERENCES employees(id), vehicle_id TEXT,
        start_time TEXT NOT NULL, end_time TEXT NOT NULL, weekdays TEXT NOT NULL DEFAULT '[]',
        created_by TEXT NOT NULL REFERENCES users(id), created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec(`
      DELETE FROM shift_templates; DELETE FROM activities; DELETE FROM shifts;
      DELETE FROM vehicles; DELETE FROM employees; DELETE FROM users; DELETE FROM companies;
    `)
    seed()
  })

  afterAll(() => {
    sqlite.close()
  })

  function makeTemplate(weekdays: number[]) {
    return shiftTemplateService.createTemplate(
      { name: 'morning crew', employeeId: 'emp_1', startTime: '08:00', endTime: '16:00', weekdays },
      'company_1',
      'user_1',
    )
  }

  it('creates a template and returns it through the overview', () => {
    makeTemplate([1, 3])
    const overview = shiftTemplateService.getOverview('company_1')
    expect(overview.templates).toHaveLength(1)
    expect(overview.templates[0].weekdays).toEqual([1, 3])
    expect(overview.employees).toHaveLength(1)
  })

  it('generates one shift per matching weekday in the target week', () => {
    const template = makeTemplate([1, 3])
    const shifts = shiftTemplateService.applyTemplate(template.id, '2026-06-01', 'company_1')

    expect(shifts).toHaveLength(2)
    const days = shifts.map(s => new Date(`${s.date}T00:00:00Z`).getUTCDay()).sort()
    expect(days).toEqual([1, 3])
    expect(shifts.every(s => s.startTime === '08:00' && s.status === 'scheduled')).toBe(true)
  })

  it('rejects a template for an unknown employee', () => {
    expect(() =>
      shiftTemplateService.createTemplate(
        { name: 'x', employeeId: 'missing', startTime: '08:00', endTime: '16:00', weekdays: [1] },
        'company_1',
        'user_1',
      ),
    ).toThrow('employee not found')
  })

  it('removes a template', () => {
    const template = makeTemplate([2])
    shiftTemplateService.removeTemplate(template.id, 'company_1')
    expect(shiftTemplateService.getOverview('company_1').templates).toHaveLength(0)
  })
})
