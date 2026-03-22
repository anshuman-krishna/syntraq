import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'manager', 'operator'] }).notNull().default('operator'),
  companyId: text('company_id').notNull().references(() => companies.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

export const employees = sqliteTable('employees', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  role: text('role', { enum: ['driver', 'operator', 'mechanic', 'supervisor'] }).notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull().default(''),
  hireDate: text('hire_date').notNull(),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const shifts = sqliteTable('shifts', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  employeeId: text('employee_id').notNull().references(() => employees.id),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status', { enum: ['scheduled', 'active', 'completed', 'cancelled'] }).notNull().default('scheduled'),
  vehicleId: text('vehicle_id').references(() => vehicles.id),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  plate: text('plate').notNull(),
  type: text('type', { enum: ['truck', 'hydrovac', 'service'] }).notNull(),
  status: text('status', { enum: ['available', 'on-route', 'maintenance'] }).notNull().default('available'),
  mileage: integer('mileage').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const behaviorEvents = sqliteTable('behavior_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  companyId: text('company_id').notNull().references(() => companies.id),
  type: text('type', { enum: ['page_visit', 'action', 'hesitation'] }).notNull(),
  route: text('route').notNull(),
  action: text('action'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const workflows = sqliteTable('workflows', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  description: text('description'),
  steps: text('steps').notNull(),
  status: text('status', { enum: ['draft', 'active', 'archived'] }).notNull().default('draft'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  type: text('type', { enum: ['shift_created', 'shift_updated', 'shift_completed', 'employee_added', 'vehicle_maintenance'] }).notNull(),
  description: text('description').notNull(),
  employeeId: text('employee_id').references(() => employees.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const replaySessions = sqliteTable('replay_sessions', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  userId: text('user_id').notNull().references(() => users.id),
  userName: text('user_name').notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  route: text('route').notNull(),
  eventCount: integer('event_count').notNull().default(0),
})

export const replayEvents = sqliteTable('replay_events', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => replaySessions.id),
  companyId: text('company_id').notNull().references(() => companies.id),
  type: text('type').notNull(),
  route: text('route').notNull(),
  action: text('action'),
  metadata: text('metadata'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
