import type { H3Event } from 'h3'
import { z } from 'zod'
import { automationService } from '../services/automationService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const automationConditionSchema = z.object({
  field: z.string().trim().min(1),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
  value: z.union([z.string(), z.number(), z.boolean()]),
})

const automationActionSchema = z.object({
  type: z.enum(['send_notification', 'create_escalation', 'update_status', 'trigger_webhook', 'log_audit']),
  config: z.record(z.string(), z.unknown()),
})

const createAutomationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  trigger: z.enum([
    'shift.created',
    'shift.completed',
    'shift.cancelled',
    'employee.created',
    'vehicle.status_changed',
    'approval.resolved',
    'escalation.created',
  ]),
  conditions: z.array(automationConditionSchema).default([]),
  actions: z.array(automationActionSchema).min(1),
})

const updateAutomationSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(100).optional(),
  conditions: z.array(automationConditionSchema).optional(),
  actions: z.array(automationActionSchema).min(1).optional(),
  active: z.boolean().optional(),
})

const removeAutomationSchema = z.object({
  id: z.string().trim().min(1),
})

export const automationController = {
  list(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage automations')

    const automations = automationService.list(user.companyId)
    return { automations }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'create automation')

    const body = await readBodyWithSchema(event, createAutomationSchema)

    try {
      const automation = automationService.create(
        user.companyId, user.id, body.name, body.trigger, body.conditions, body.actions,
      )

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'automation.created',
        entityType: 'automation',
        entityId: automation.id,
      })

      return { automation }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async update(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'update automation')

    const body = await readBodyWithSchema(event, updateAutomationSchema)

    try {
      const automation = automationService.update(body.id, user.companyId, {
        name: body.name,
        conditions: body.conditions,
        actions: body.actions,
        active: body.active,
      })

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'automation.updated',
        entityType: 'automation',
        entityId: body.id,
      })

      return { automation }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async remove(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'delete automation')

    const body = await readBodyWithSchema(event, removeAutomationSchema)

    try {
      automationService.remove(body.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'automation.deleted',
        entityType: 'automation',
        entityId: body.id,
      })

      return { success: true }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
