import Database from 'better-sqlite3'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { exportService } from '../../server/services/exportService'

function resolveDbPath() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL not configured for tests')
  return raw.startsWith('file:') ? raw.slice('file:'.length) : raw
}

const now = Date.now()
const sqlite = new Database(resolveDbPath())

function insertVehicle(id: string, companyId: string, name: string) {
  sqlite.prepare(
    'INSERT INTO vehicles (id, company_id, name, plate, type, status, mileage, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(id, companyId, name, 'XYZ-9', 'truck', 'available', 1000, now)
}

describe.sequential('export service against sqlite', () => {
  beforeAll(() => {
    sqlite.pragma('foreign_keys = ON')
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id),
        name TEXT NOT NULL, plate TEXT NOT NULL, type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'available', mileage INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
    `)
  })

  beforeEach(() => {
    sqlite.exec('DELETE FROM vehicles; DELETE FROM companies;')
    sqlite.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run('company_1', 'Acme', now)
  })

  afterAll(() => {
    sqlite.close()
  })

  it('serializes rows to csv with a stable header', () => {
    insertVehicle('vehicle_1', 'company_1', 'Rig 7')

    const result = exportService.build('vehicles', 'company_1', 'csv')
    const lines = result.content.split('\n')

    expect(result.contentType).toBe('text/csv')
    expect(result.filename).toMatch(/^vehicles-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(lines[0]).toBe('id,name,plate,type,status,mileage,createdAt')
    expect(lines[1]).toContain('vehicle_1,Rig 7,XYZ-9,truck')
  })

  it('escapes values that contain commas', () => {
    insertVehicle('vehicle_2', 'company_1', 'Rig 7, North')

    const result = exportService.build('vehicles', 'company_1', 'csv')
    expect(result.content).toContain('"Rig 7, North"')
  })

  it('returns valid json when asked', () => {
    insertVehicle('vehicle_1', 'company_1', 'Rig 7')

    const result = exportService.build('vehicles', 'company_1', 'json')
    const parsed = JSON.parse(result.content)

    expect(result.contentType).toBe('application/json')
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({ id: 'vehicle_1', name: 'Rig 7' })
  })

  it('scopes the export to the requesting company', () => {
    insertVehicle('vehicle_1', 'company_1', 'Rig 7')

    const result = exportService.build('vehicles', 'company_2', 'csv')
    // header only, no rows
    expect(result.content.split('\n')).toHaveLength(1)
  })

  it('exposes the supported entities', () => {
    expect(exportService.entities).toEqual(['shifts', 'employees', 'vehicles', 'audit'])
  })
})
