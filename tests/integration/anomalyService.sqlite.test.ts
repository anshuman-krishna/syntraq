import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { anomalyService } from '../../server/services/anomalyService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function today() {
  return new Date().toISOString().split('T')[0]!
}

function addEmployee(id: string, name: string) {
  sqlite.prepare(
    'INSERT INTO employees (id, company_id, name, role, email, phone, hire_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, 'company_1', name, 'driver', `${id}@syntraq.io`, '', '2024-01-01', 'active', now)
}

function addVehicle(id: string, name: string) {
  sqlite.prepare(
    'INSERT INTO vehicles (id, company_id, name, plate, type, status, mileage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, 'company_1', name, 'PLT-1', 'truck', 'available', 0, now)
}

let shiftSeq = 0
function addShift(employeeId: string, date: string, start: string, end: string, vehicleId: string | null = null) {
  sqlite.prepare(
    'INSERT INTO shifts (id, company_id, employee_id, date, start_time, end_time, status, vehicle_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(`shift_${++shiftSeq}`, 'company_1', employeeId, date, start, end, 'scheduled', vehicleId, null, now)
}

describe.sequential('anomaly service against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        role TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', hire_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL
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
        vehicle_id TEXT REFERENCES vehicles(id), notes TEXT, created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    shiftSeq = 0
    sqlite.exec('DELETE FROM shifts; DELETE FROM vehicles; DELETE FROM employees; DELETE FROM companies;')
    sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  })

  afterAll(() => {
    sqlite.close()
  })

  it('flags overlapping shifts for the same employee', () => {
    addEmployee('emp_1', 'Dana')
    addShift('emp_1', today(), '08:00', '12:00')
    addShift('emp_1', today(), '11:00', '15:00')

    const overlaps = anomalyService.detect('company_1').filter(a => a.type === 'overlap')
    expect(overlaps).toHaveLength(1)
    expect(overlaps[0]?.severity).toBe('high')
    expect(overlaps[0]?.entityId).toBe('emp_1')
  })

  it('flags a vehicle double-booked across employees', () => {
    addEmployee('emp_1', 'Dana')
    addEmployee('emp_2', 'Sam')
    addVehicle('veh_1', 'Rig 7')
    addShift('emp_1', today(), '08:00', '12:00', 'veh_1')
    addShift('emp_2', today(), '10:00', '14:00', 'veh_1')

    const conflicts = anomalyService.detect('company_1').filter(a => a.type === 'double_booking')
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]?.entityId).toBe('veh_1')
  })

  it('flags excessive weekly hours', () => {
    addEmployee('emp_1', 'Dana')
    // monday of the current week
    const today_ = new Date()
    const monday = new Date(today_)
    monday.setDate(today_.getDate() - ((today_.getDay() + 6) % 7))
    for (let d = 0; d < 6; d++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + d)
      addShift('emp_1', date.toISOString().split('T')[0]!, '06:00', '18:00') // 12h x6 = 72h
    }

    const excessive = anomalyService.detect('company_1').filter(a => a.type === 'excessive_hours')
    expect(excessive).toHaveLength(1)
    expect(excessive[0]?.severity).toBe('high')
  })

  it('returns no anomalies for a clean schedule', () => {
    addEmployee('emp_1', 'Dana')
    addShift('emp_1', today(), '08:00', '12:00')

    const overlaps = anomalyService.detect('company_1').filter(a => a.type === 'overlap')
    expect(overlaps).toHaveLength(0)
  })

  it('scopes detection to the requesting company', () => {
    addEmployee('emp_1', 'Dana')
    addShift('emp_1', today(), '08:00', '12:00')
    addShift('emp_1', today(), '11:00', '15:00')

    expect(anomalyService.detect('company_2')).toHaveLength(0)
  })
})
