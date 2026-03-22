import { generateId } from '../../shared/utils/id'
import { automationModel } from '../models/automationModel'
import { webhookService } from './webhookService'
import { notificationService } from './notificationService'
import { auditService } from './auditService'
import { loggerService } from './loggerService'
import { AppError } from './authService'
import type { AutomationCondition, AutomationAction, AutomationTrigger } from '../../shared/types/integrations'

const VALID_TRIGGERS: AutomationTrigger[] = [
  'shift.created', 'shift.completed', 'shift.cancelled',
  'employee.created', 'vehicle.status_changed',
  'approval.resolved', 'escalation.created',
]

export const automationService = {
  create(
    companyId: string,
    createdBy: string,
    name: string,
    trigger: string,
    conditions: AutomationCondition[],
    actions: AutomationAction[],
  ) {
    if (!name.trim()) throw new AppError('automation name is required', 400)
    if (!VALID_TRIGGERS.includes(trigger as AutomationTrigger)) {
      throw new AppError(`invalid trigger: ${trigger}`, 400)
    }
    if (!actions.length) throw new AppError('at least one action is required', 400)

    return automationModel.create({
      id: generateId(),
      companyId,
      name: name.trim(),
      trigger,
      conditions: JSON.stringify(conditions),
      actions: JSON.stringify(actions),
      createdBy,
    })
  },

  list(companyId: string) {
    return automationModel.findAll(companyId).map(a => ({
      id: a.id,
      name: a.name,
      trigger: a.trigger,
      conditions: JSON.parse(a.conditions) as AutomationCondition[],
      actions: JSON.parse(a.actions) as AutomationAction[],
      active: a.active,
      triggerCount: a.triggerCount,
      lastTriggeredAt: a.lastTriggeredAt,
      createdAt: a.createdAt,
    }))
  },

  update(id: string, companyId: string, data: {
    name?: string
    conditions?: AutomationCondition[]
    actions?: AutomationAction[]
    active?: boolean
  }) {
    const existing = automationModel.findById(id, companyId)
    if (!existing) throw new AppError('automation not found', 404)

    const updates: Record<string, unknown> = {}
    if (data.name !== undefined) updates.name = data.name.trim()
    if (data.conditions !== undefined) updates.conditions = JSON.stringify(data.conditions)
    if (data.actions !== undefined) updates.actions = JSON.stringify(data.actions)
    if (data.active !== undefined) updates.active = data.active

    return automationModel.update(id, companyId, updates)
  },

  remove(id: string, companyId: string) {
    const existing = automationModel.findById(id, companyId)
    if (!existing) throw new AppError('automation not found', 404)
    automationModel.remove(id, companyId)
    return { success: true }
  },

  // execute automations matching a trigger event
  async execute(companyId: string, trigger: string, eventData: Record<string, unknown>) {
    const rules = automationModel.findByTrigger(trigger, companyId)

    for (const rule of rules) {
      const conditions = JSON.parse(rule.conditions) as AutomationCondition[]
      const actions = JSON.parse(rule.actions) as AutomationAction[]

      // evaluate conditions
      if (!this.evaluateConditions(conditions, eventData)) continue

      // run actions
      for (const action of actions) {
        try {
          await this.runAction(companyId, action, trigger, eventData)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'unknown error'
          loggerService.error('automation action failed', {
            automationId: rule.id,
            action: action.type,
            error: message,
          })
        }
      }

      automationModel.incrementTriggerCount(rule.id)
    }
  },

  evaluateConditions(conditions: AutomationCondition[], data: Record<string, unknown>): boolean {
    if (conditions.length === 0) return true

    return conditions.every(condition => {
      const value = data[condition.field]
      switch (condition.operator) {
        case 'equals': return value === condition.value
        case 'not_equals': return value !== condition.value
        case 'contains': return typeof value === 'string' && value.includes(String(condition.value))
        case 'greater_than': return typeof value === 'number' && value > Number(condition.value)
        case 'less_than': return typeof value === 'number' && value < Number(condition.value)
        default: return false
      }
    })
  },

  async runAction(
    companyId: string,
    action: AutomationAction,
    trigger: string,
    eventData: Record<string, unknown>,
  ) {
    switch (action.type) {
      case 'send_notification': {
        const userId = String(action.config.userId ?? '')
        const title = String(action.config.title ?? `automation: ${trigger}`)
        const message = String(action.config.message ?? 'an automation was triggered')
        if (userId) {
          notificationService.create(userId, companyId, 'automation', title, message)
        }
        break
      }

      case 'trigger_webhook': {
        await webhookService.dispatch(companyId, trigger, eventData)
        break
      }

      case 'log_audit': {
        auditService.log({
          companyId,
          userId: String(action.config.userId ?? 'system'),
          action: `automation.${trigger}`,
          entityType: String(action.config.entityType ?? 'automation'),
          entityId: String(action.config.entityId ?? ''),
          metadata: eventData,
        })
        break
      }

      default:
        loggerService.warn('unknown automation action type', { type: action.type })
    }
  },
}
