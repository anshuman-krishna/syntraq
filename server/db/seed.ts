import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { hash } from '@node-rs/argon2'
import * as schema from './schema'

const sqlite = new Database('db.sqlite')
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
const db = drizzle(sqlite, { schema })

function id(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, '0')}`
}

async function seed() {
  // drop and recreate all tables for clean state
  sqlite.exec(`
    DROP TABLE IF EXISTS replay_events;
    DROP TABLE IF EXISTS replay_sessions;
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS workflows;
    DROP TABLE IF EXISTS behavior_events;
    DROP TABLE IF EXISTS activities;
    DROP TABLE IF EXISTS shifts;
    DROP TABLE IF EXISTS vehicles;
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS companies;

    CREATE TABLE companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      company_id TEXT NOT NULL REFERENCES companies(id),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE employees (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      hire_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE vehicles (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      name TEXT NOT NULL,
      plate TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      mileage INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE shifts (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      employee_id TEXT NOT NULL REFERENCES employees(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      vehicle_id TEXT REFERENCES vehicles(id),
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE activities (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      employee_id TEXT REFERENCES employees(id),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE behavior_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      company_id TEXT NOT NULL REFERENCES companies(id),
      type TEXT NOT NULL,
      route TEXT NOT NULL,
      action TEXT,
      metadata TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE workflows (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      name TEXT NOT NULL,
      description TEXT,
      steps TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE replay_sessions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      user_name TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      route TEXT NOT NULL,
      event_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE replay_events (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES replay_sessions(id),
      company_id TEXT NOT NULL REFERENCES companies(id),
      type TEXT NOT NULL,
      route TEXT NOT NULL,
      action TEXT,
      metadata TEXT,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      metadata TEXT,
      created_at INTEGER NOT NULL
    );
  `)

  const passwordHash = await hash('password123', {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })

  const companyId = id('cmp', 1)

  // seed company
  db.insert(schema.companies).values({
    id: companyId,
    name: 'syntraq demo',
  }).run()

  // seed users
  db.insert(schema.users).values({
    id: id('usr', 1),
    email: 'admin@syntraq.io',
    passwordHash,
    name: 'admin user',
    role: 'admin',
    companyId,
  }).run()

  db.insert(schema.users).values({
    id: id('usr', 2),
    email: 'manager@syntraq.io',
    passwordHash,
    name: 'demo manager',
    role: 'manager',
    companyId,
  }).run()

  db.insert(schema.users).values({
    id: id('usr', 3),
    email: 'operator@syntraq.io',
    passwordHash,
    name: 'demo operator',
    role: 'operator',
    companyId,
  }).run()

  // seed employees
  const employeeData = [
    { name: 'marcus johnson', role: 'driver', email: 'marcus@syntraq.io', phone: '(403) 555-0101', hireDate: '2023-06-15' },
    { name: 'sarah chen', role: 'operator', email: 'sarah@syntraq.io', phone: '(403) 555-0102', hireDate: '2023-01-20' },
    { name: 'david williams', role: 'driver', email: 'david@syntraq.io', phone: '(403) 555-0103', hireDate: '2024-03-10' },
    { name: 'elena rodriguez', role: 'mechanic', email: 'elena@syntraq.io', phone: '(403) 555-0104', hireDate: '2022-11-05' },
    { name: 'james parker', role: 'supervisor', email: 'james@syntraq.io', phone: '(403) 555-0105', hireDate: '2022-04-18' },
    { name: 'aisha patel', role: 'driver', email: 'aisha@syntraq.io', phone: '(403) 555-0106', hireDate: '2024-01-08' },
    { name: 'ryan kim', role: 'operator', email: 'ryan@syntraq.io', phone: '(403) 555-0107', hireDate: '2023-09-22' },
    { name: 'lisa nguyen', role: 'mechanic', email: 'lisa@syntraq.io', phone: '(403) 555-0108', hireDate: '2023-07-14' },
    { name: 'tom bradley', role: 'driver', email: 'tom@syntraq.io', phone: '(403) 555-0109', hireDate: '2024-05-01' },
    { name: 'maya foster', role: 'supervisor', email: 'maya@syntraq.io', phone: '(403) 555-0110', hireDate: '2022-08-30' },
  ] as const

  employeeData.forEach((emp, i) => {
    db.insert(schema.employees).values({
      id: id('emp', i + 1),
      companyId,
      ...emp,
      status: 'active',
    }).run()
  })

  // seed vehicles
  const vehicleData = [
    { name: 'unit 101', plate: 'AB-3421', type: 'truck', status: 'on-route', mileage: 142300 },
    { name: 'unit 102', plate: 'AB-3422', type: 'truck', status: 'available', mileage: 98500 },
    { name: 'unit 201', plate: 'AB-5601', type: 'hydrovac', status: 'on-route', mileage: 67200 },
    { name: 'unit 202', plate: 'AB-5602', type: 'hydrovac', status: 'maintenance', mileage: 115800 },
    { name: 'unit 301', plate: 'AB-7801', type: 'service', status: 'available', mileage: 45600 },
    { name: 'unit 103', plate: 'AB-3423', type: 'truck', status: 'available', mileage: 78900 },
    { name: 'unit 203', plate: 'AB-5603', type: 'hydrovac', status: 'on-route', mileage: 89100 },
    { name: 'unit 302', plate: 'AB-7802', type: 'service', status: 'on-route', mileage: 32400 },
  ] as const

  vehicleData.forEach((veh, i) => {
    db.insert(schema.vehicles).values({
      id: id('veh', i + 1),
      companyId,
      ...veh,
    }).run()
  })

  // seed shifts
  const today = new Date()
  const statuses = ['scheduled', 'active', 'completed', 'cancelled'] as const
  let shiftCount = 0

  employeeData.forEach((_, empIdx) => {
    for (let d = -3; d <= 5; d++) {
      if (Math.random() > 0.65) continue
      const date = new Date(today)
      date.setDate(date.getDate() + d)
      const startHour = 6 + Math.floor(Math.random() * 8)
      const duration = 6 + Math.floor(Math.random() * 6)

      let status: typeof statuses[number]
      if (d < -1) status = 'completed'
      else if (d === -1) status = Math.random() > 0.2 ? 'completed' : 'cancelled'
      else if (d === 0) status = Math.random() > 0.3 ? 'active' : 'completed'
      else status = Math.random() > 0.15 ? 'scheduled' : 'cancelled'

      shiftCount++
      db.insert(schema.shifts).values({
        id: id('sft', shiftCount),
        companyId,
        employeeId: id('emp', empIdx + 1),
        date: date.toISOString().split('T')[0],
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(Math.min(startHour + duration, 23)).padStart(2, '0')}:00`,
        status,
        vehicleId: Math.random() > 0.3 ? id('veh', Math.floor(Math.random() * 8) + 1) : null,
      }).run()
    }
  })

  // seed activities
  const activityTypes = ['shift_created', 'shift_updated', 'shift_completed', 'vehicle_maintenance'] as const
  const activityDescriptions = [
    'shift created for marcus johnson',
    'shift updated for sarah chen',
    'david williams completed shift',
    'unit 202 scheduled for oil change',
    'shift created for aisha patel',
    'james parker approved roster change',
    'elena rodriguez completed inspection',
    'unit 103 returned from route',
    'shift cancelled for ryan kim',
    'lisa nguyen started maintenance check',
  ]

  activityDescriptions.forEach((desc, i) => {
    const hoursAgo = i * 0.5 + Math.random() * 2
    db.insert(schema.activities).values({
      id: id('act', i + 1),
      companyId,
      type: activityTypes[i % activityTypes.length],
      description: desc,
      employeeId: i < 8 ? id('emp', (i % 10) + 1) : null,
      createdAt: new Date(Date.now() - hoursAgo * 3600000),
    }).run()
  })

  // seed workflows
  const sampleWorkflows = [
    {
      id: id('wfl', 1),
      companyId,
      name: 'pre-trip inspection',
      description: 'standard vehicle inspection before dispatch',
      steps: JSON.stringify([
        { id: 'step-1', name: 'check tire pressure', description: 'all tires within spec', order: 1 },
        { id: 'step-2', name: 'fluid levels', description: 'oil, coolant, washer fluid', order: 2 },
        { id: 'step-3', name: 'lights and signals', description: 'headlights, brake lights, turn signals', order: 3 },
        { id: 'step-4', name: 'safety equipment', description: 'fire extinguisher, first aid kit, triangles', order: 4 },
        { id: 'step-5', name: 'sign off', description: 'driver signature and timestamp', order: 5 },
      ]),
      status: 'active' as const,
      createdBy: id('usr', 1),
    },
    {
      id: id('wfl', 2),
      companyId,
      name: 'new driver onboarding',
      description: 'checklist for onboarding new drivers',
      steps: JSON.stringify([
        { id: 'step-1', name: 'documentation', description: 'license, insurance, certifications', order: 1 },
        { id: 'step-2', name: 'safety orientation', description: 'company safety policies review', order: 2 },
        { id: 'step-3', name: 'vehicle familiarization', description: 'assigned unit walkthrough', order: 3 },
        { id: 'step-4', name: 'route training', description: 'shadow ride with supervisor', order: 4 },
      ]),
      status: 'draft' as const,
      createdBy: id('usr', 1),
    },
  ]

  sampleWorkflows.forEach(wf => {
    db.insert(schema.workflows).values(wf).run()
  })

  // eslint-disable-next-line no-console
  console.log(`seeded: 1 company, 3 users, ${employeeData.length} employees, ${vehicleData.length} vehicles, ${shiftCount} shifts, ${activityDescriptions.length} activities, ${sampleWorkflows.length} workflows`)
  sqlite.close()
}

seed().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('seed failed:', e)
  process.exit(1)
})
