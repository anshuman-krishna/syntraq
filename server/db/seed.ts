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
  // create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      hire_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plate TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      mileage INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      vehicle_id TEXT REFERENCES vehicles(id),
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      employee_id TEXT REFERENCES employees(id),
      created_at INTEGER NOT NULL
    );
  `)

  // clear existing data
  sqlite.exec('DELETE FROM activities')
  sqlite.exec('DELETE FROM shifts')
  sqlite.exec('DELETE FROM vehicles')
  sqlite.exec('DELETE FROM employees')
  sqlite.exec('DELETE FROM sessions')
  sqlite.exec('DELETE FROM users')

  // seed admin user
  const passwordHash = await hash('password123', {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })

  db.insert(schema.users).values({
    id: id('usr', 1),
    email: 'admin@syntraq.io',
    passwordHash,
    name: 'admin user',
    role: 'admin',
  }).run()

  db.insert(schema.users).values({
    id: id('usr', 2),
    email: 'demo@syntraq.io',
    passwordHash,
    name: 'demo user',
    role: 'manager',
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
      type: activityTypes[i % activityTypes.length],
      description: desc,
      employeeId: i < 8 ? id('emp', (i % 10) + 1) : null,
      createdAt: new Date(Date.now() - hoursAgo * 3600000),
    }).run()
  })

  // eslint-disable-next-line no-console
  console.log(`seeded: 2 users, ${employeeData.length} employees, ${vehicleData.length} vehicles, ${shiftCount} shifts, ${activityDescriptions.length} activities`)
  sqlite.close()
}

seed().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('seed failed:', e)
  process.exit(1)
})
