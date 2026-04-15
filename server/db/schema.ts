import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  // nullable so oauth-only users can exist without a local password
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'manager', 'operator'] }).notNull().default('operator'),
  companyId: text('company_id').notNull().references(() => companies.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const oauthAccounts = sqliteTable('oauth_accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  provider: text('provider', { enum: ['google', 'microsoft'] }).notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const userTotp = sqliteTable('user_totp', {
  userId: text('user_id').primaryKey().references(() => users.id),
  secret: text('secret').notNull(),
  verifiedAt: integer('verified_at', { mode: 'timestamp' }),
  recoveryCodesHash: text('recovery_codes_hash'),
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

export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  stripePriceId: text('stripe_price_id'),
  maxUsers: integer('max_users').notNull(),
  maxEmployees: integer('max_employees').notNull(),
  maxShiftsPerMonth: integer('max_shifts_per_month').notNull(),
  maxWorkflows: integer('max_workflows').notNull(),
  features: text('features').notNull().default('{}'),
  price: integer('price').notNull().default(0),
})

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  planId: text('plan_id').notNull().references(() => plans.id),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status', { enum: ['active', 'cancelled', 'expired'] }).notNull().default('active'),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const onboardingProgress = sqliteTable('onboarding_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  companyId: text('company_id').notNull().references(() => companies.id),
  completedSteps: text('completed_steps').notNull().default('[]'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  channelId: text('channel_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  userName: text('user_name').notNull(),
  content: text('content').notNull(),
  replyTo: text('reply_to'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  userName: text('user_name').notNull(),
  content: text('content').notNull(),
  resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const approvals = sqliteTable('approvals', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  requestedBy: text('requested_by').notNull().references(() => users.id),
  assignedTo: text('assigned_to').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
})

export const escalations = sqliteTable('escalations', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  assignedTo: text('assigned_to').notNull().references(() => users.id),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'critical'] }).notNull().default('medium'),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['open', 'acknowledged', 'resolved'] }).notNull().default('open'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
})

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  permissions: text('permissions').notNull().default('{}'),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const webhooks = sqliteTable('webhooks', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  url: text('url').notNull(),
  eventTypes: text('event_types').notNull(),
  secret: text('secret').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  lastTriggeredAt: integer('last_triggered_at', { mode: 'timestamp' }),
  failureCount: integer('failure_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const webhookLogs = sqliteTable('webhook_logs', {
  id: text('id').primaryKey(),
  webhookId: text('webhook_id').notNull().references(() => webhooks.id),
  companyId: text('company_id').notNull().references(() => companies.id),
  eventType: text('event_type').notNull(),
  status: integer('status').notNull(),
  responseTime: integer('response_time'),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const apiUsageLogs = sqliteTable('api_usage_logs', {
  id: text('id').primaryKey(),
  apiKeyId: text('api_key_id').notNull().references(() => apiKeys.id),
  companyId: text('company_id').notNull().references(() => companies.id),
  method: text('method').notNull(),
  path: text('path').notNull(),
  statusCode: integer('status_code').notNull(),
  responseTime: integer('response_time'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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

export const automations = sqliteTable('automations', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull().references(() => companies.id),
  name: text('name').notNull(),
  trigger: text('trigger').notNull(),
  conditions: text('conditions').notNull().default('[]'),
  actions: text('actions').notNull().default('[]'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  lastTriggeredAt: integer('last_triggered_at', { mode: 'timestamp' }),
  triggerCount: integer('trigger_count').notNull().default(0),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
