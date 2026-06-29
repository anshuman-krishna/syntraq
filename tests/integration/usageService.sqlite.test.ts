import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { usageService } from '../../server/services/usageService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function thisMonthDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-15`
}

function addEmployee(id: string) {
  sqlite.prepare(
    'INSERT INTO employees (id, company_id, name, role, email, phone, hire_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, 'company_1', id, 'driver', `${id}@s.io`, '', '2024-01-01', 'active', now)
}

let shiftSeq = 0
function addShift(date: string) {
  sqlite.prepare(
    'INSERT INTO shifts (id, company_id, employee_id, date, start_time, end_time, status, vehicle_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(`shift_${++shiftSeq}`, 'company_1', 'emp_base', date, '08:00', '12:00', 'scheduled', null, null, now)
}

describe.sequential('usage service against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        role TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', hire_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        employee_id TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled', vehicle_id TEXT, notes TEXT, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        description TEXT, steps TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'draft',
        created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, stripe_price_id TEXT, max_users INTEGER NOT NULL,
        max_employees INTEGER NOT NULL, max_shifts_per_month INTEGER NOT NULL, max_workflows INTEGER NOT NULL,
        features TEXT NOT NULL DEFAULT '{}', price INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        plan_id TEXT NOT NULL REFERENCES plans(id), stripe_customer_id TEXT, stripe_subscription_id TEXT,
        status TEXT NOT NULL DEFAULT 'active', current_period_end INTEGER, created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    shiftSeq = 0
    sqlite.exec('DELETE FROM subscriptions; DELETE FROM plans; DELETE FROM workflows; DELETE FROM shifts; DELETE FROM employees; DELETE FROM companies;')
    sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  })

  afterAll(() => {
    sqlite.close()
  })

  it('falls back to free limits when no subscription exists', () => {
    const limits = usageService.getPlanLimits('company_1')
    expect(limits.maxEmployees).toBe(5)
    expect(limits.features.replay).toBe(false)
  })

  it('reads limits from the subscribed plan', () => {
    sqlite.prepare(
      'INSERT INTO plans (id, name, max_users, max_employees, max_shifts_per_month, max_workflows, features, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).run('pro', 'pro', 20, 100, 5000, 50, JSON.stringify({ replay: true }), 4900)
    sqlite.prepare(
      'INSERT INTO subscriptions (id, company_id, plan_id, status, created_at) VALUES (?, ?, ?, ?, ?)',
    ).run('sub_1', 'company_1', 'pro', 'active', now)

    const limits = usageService.getPlanLimits('company_1')
    expect(limits.maxEmployees).toBe(100)
    expect(limits.features.replay).toBe(true)
  })

  it('counts only shifts created in the current month', () => {
    addShift(thisMonthDate())
    addShift(thisMonthDate())
    addShift('2020-01-01')

    const usage = usageService.getUsage('company_1')
    expect(usage.shifts).toBe(2)
    expect(usage.totalShifts).toBe(3)
  })

  it('throws when the employee limit is reached', () => {
    for (let i = 0; i < 5; i++) addEmployee(`emp_${i}`)
    expect(() => usageService.checkEmployeeLimit('company_1')).toThrow('employee limit reached')
  })

  it('blocks gated features on the free plan', () => {
    expect(() => usageService.checkFeature('company_1', 'replay')).toThrow('requires a paid plan')
  })
})
