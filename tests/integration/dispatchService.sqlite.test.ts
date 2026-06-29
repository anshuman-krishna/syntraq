import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { dispatchService } from '../../server/services/dispatchService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())
const DATE = '2026-06-15'

function addEmployee(id: string, name: string) {
  sqlite.prepare(
    'INSERT INTO employees (id, company_id, name, role, email, phone, hire_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, 'company_1', name, 'driver', `${id}@s.io`, '', '2024-01-01', 'active', now)
}

function addVehicle(id: string, name: string) {
  sqlite.prepare(
    'INSERT INTO vehicles (id, company_id, name, plate, type, status, mileage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, 'company_1', name, 'PLT', 'truck', 'available', 0, now)
}

let seq = 0
function addShift(employeeId: string, start: string, end: string, vehicleId: string | null = null) {
  const id = `shift_${++seq}`
  sqlite.prepare(
    'INSERT INTO shifts (id, company_id, employee_id, date, start_time, end_time, status, vehicle_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, 'company_1', employeeId, DATE, start, end, 'scheduled', vehicleId, null, now)
  return id
}

describe.sequential('dispatch service against sqlite', () => {
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
    seq = 0
    sqlite.exec('DELETE FROM shifts; DELETE FROM vehicles; DELETE FROM employees; DELETE FROM companies;')
    sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
    addEmployee('emp_1', 'Dana')
    addEmployee('emp_2', 'Sam')
    addVehicle('veh_1', 'Rig 7')
  })

  afterAll(() => {
    sqlite.close()
  })

  it('groups shifts under vehicles and buckets the unassigned', () => {
    addShift('emp_1', '08:00', '12:00', 'veh_1')
    addShift('emp_2', '09:00', '13:00')

    const board = dispatchService.getBoard('company_1', DATE)
    expect(board.assignments).toHaveLength(1)
    expect(board.assignments[0]?.shifts).toHaveLength(1)
    expect(board.unassigned).toHaveLength(1)
    expect(board.unassigned[0]?.employeeName).toBe('Sam')
  })

  it('assigns a vehicle to a shift', () => {
    const id = addShift('emp_1', '08:00', '12:00')
    dispatchService.assignVehicle(id, 'veh_1', 'company_1')

    const board = dispatchService.getBoard('company_1', DATE)
    expect(board.unassigned).toHaveLength(0)
    expect(board.assignments[0]?.shifts[0]?.id).toBe(id)
  })

  it('clears an assignment when vehicleId is null', () => {
    const id = addShift('emp_1', '08:00', '12:00', 'veh_1')
    dispatchService.assignVehicle(id, null, 'company_1')
    expect(dispatchService.getBoard('company_1', DATE).unassigned).toHaveLength(1)
  })

  it('rejects double-booking a vehicle on overlapping shifts', () => {
    addShift('emp_1', '08:00', '12:00', 'veh_1')
    const second = addShift('emp_2', '10:00', '14:00')
    expect(() => dispatchService.assignVehicle(second, 'veh_1', 'company_1')).toThrow('overlapping')
  })

  it('allows the same vehicle on non-overlapping shifts', () => {
    addShift('emp_1', '08:00', '12:00', 'veh_1')
    const second = addShift('emp_2', '12:00', '16:00')
    expect(() => dispatchService.assignVehicle(second, 'veh_1', 'company_1')).not.toThrow()
  })

  it('rejects an unknown shift or vehicle', () => {
    const id = addShift('emp_1', '08:00', '12:00')
    expect(() => dispatchService.assignVehicle('missing', 'veh_1', 'company_1')).toThrow('shift not found')
    expect(() => dispatchService.assignVehicle(id, 'missing', 'company_1')).toThrow('vehicle not found')
  })
})
