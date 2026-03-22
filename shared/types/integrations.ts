// webhook event types
export type WebhookEventType =
  | 'shift.created'
  | 'shift.updated'
  | 'shift.completed'
  | 'shift.cancelled'
  | 'employee.created'
  | 'employee.updated'
  | 'workflow.created'
  | 'workflow.completed'
  | 'vehicle.status_changed'
  | 'approval.created'
  | 'approval.resolved'
  | 'escalation.created'
  | 'escalation.resolved'

export interface WebhookPayload {
  event: WebhookEventType
  timestamp: string
  companyId: string
  data: Record<string, unknown>
}

export interface WebhookConfig {
  id: string
  companyId: string
  url: string
  events: WebhookEventType[]
  active: boolean
  secret: string
}

// api key types
export interface ApiKeyInfo {
  id: string
  name: string
  prefix: string
  permissions: ApiKeyPermissions
  lastUsedAt: Date | null
  createdAt: Date
}

export interface ApiKeyPermissions {
  employees?: boolean
  shifts?: boolean
  vehicles?: boolean
  workflows?: boolean
}

// automation engine types
export type AutomationTrigger =
  | 'shift.created'
  | 'shift.completed'
  | 'shift.cancelled'
  | 'employee.created'
  | 'vehicle.status_changed'
  | 'approval.resolved'
  | 'escalation.created'

export type AutomationActionType =
  | 'send_notification'
  | 'create_escalation'
  | 'update_status'
  | 'trigger_webhook'
  | 'log_audit'

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string | number | boolean
}

export interface AutomationAction {
  type: AutomationActionType
  config: Record<string, unknown>
}

export interface AutomationRule {
  id: string
  companyId: string
  name: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  active: boolean
  createdAt: Date
}
