import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { maintenanceService } from '../../server/services/maintenanceService'

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
  sqlite.prepare(
    'INSERT INTO vehicles (id, company_id, name, plate, type, status, mileage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run('vehicle_1', 'company_1', 'Rig 7', 'ABC-123', 'truck', 'available', 50000, now)
}

describe.sequential('maintenance service against sqlite', () => {
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
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        name TEXT NOT NULL, plate TEXT NOT NULL, type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'available', mileage INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        type TEXT NOT NULL, description TEXT NOT NULL, employee_id TEXT, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        vehicle_id TEXT NOT NULL REFERENCES vehicles(id), type TEXT NOT NULL,
        date TEXT NOT NULL, odometer INTEGER, cost INTEGER,
        status TEXT NOT NULL DEFAULT 'completed', notes TEXT,
        created_by TEXT NOT NULL REFERENCES users(id), created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec(`
      DELETE FROM maintenance_records;
      DELETE FROM activities;
      DELETE FROM vehicles;
      DELETE FROM users;
      DELETE FROM companies;
    `)
    insertBaseTenant()
  })

  afterAll(() => {
    sqlite.close()
  })

  it('creates a record enriched with the vehicle name', () => {
    const record = maintenanceService.createRecord(
      { vehicleId: 'vehicle_1', type: 'service', date: '2026-06-01', cost: 12500 },
      'company_1',
      'user_1',
    )

    expect(record).toMatchObject({
      vehicleId: 'vehicle_1',
      vehicleName: 'Rig 7',
      type: 'service',
      cost: 12500,
      status: 'completed',
    })
  })

  it('logs a vehicle_maintenance activity on create', () => {
    maintenanceService.createRecord({ vehicleId: 'vehicle_1', type: 'repair', date: '2026-06-02' }, 'company_1', 'user_1')

    const activity = sqlite.prepare('SELECT type, description FROM activities WHERE company_id = ?').get('company_1') as
      | { type: string; description: string }
      | undefined
    expect(activity?.type).toBe('vehicle_maintenance')
    expect(activity?.description).toContain('Rig 7')
  })

  it('returns records and the vehicle list from the overview', () => {
    maintenanceService.createRecord({ vehicleId: 'vehicle_1', type: 'inspection', date: '2026-06-03' }, 'company_1', 'user_1')

    const overview = maintenanceService.getOverview('company_1')
    expect(overview.records).toHaveLength(1)
    expect(overview.records[0]).toMatchObject({ vehicleName: 'Rig 7', type: 'inspection' })
    expect(overview.vehicles).toHaveLength(1)
  })

  it('rejects a record for an unknown vehicle', () => {
    expect(() =>
      maintenanceService.createRecord({ vehicleId: 'missing', type: 'service', date: '2026-06-01' }, 'company_1', 'user_1'),
    ).toThrow('vehicle not found')
  })

  it('scopes records to the requesting company', () => {
    maintenanceService.createRecord({ vehicleId: 'vehicle_1', type: 'service', date: '2026-06-01' }, 'company_1', 'user_1')

    expect(maintenanceService.getOverview('company_2').records).toHaveLength(0)
  })
})
