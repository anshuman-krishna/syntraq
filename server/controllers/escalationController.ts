import type { H3Event } from 'h3'
import { z } from 'zod'
import { escalationService } from '../services/escalationService'
import { realtimeService } from '../services/realtimeService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getQueryWithSchema, readBodyWithSchema, rethrowAsApiError } from '../utils/validation'
import { permissionService } from '../services/permissionService'

const escalationsQuerySchema = z.object({
  open: z.enum(['true', 'false']).optional(),
})

const createEscalationSchema = z.object({
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1),
  assignedTo: z.string().trim().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  reason: z.string().trim().min(1).max(2000),
})

const updateEscalationSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(['acknowledged', 'resolved']),
})

export const escalationController = {
  getEscalations(event: H3Event) {
    const user = requireAuth(event)
    const query = getQueryWithSchema(event, escalationsQuerySchema)
    const openOnly = query.open === 'true'

    const escalations = openOnly
      ? escalationService.getOpen(user.companyId)
      : escalationService.getAll(user.companyId)

    return { escalations }
  },

  async createEscalation(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, createEscalationSchema)

    const escalation = escalationService.create({
      entityType: body.entityType,
      entityId: body.entityId,
      createdBy: user.id,
      assignedTo: body.assignedTo,
      priority: body.priority,
      reason: body.reason,
      companyId: user.companyId,
    })

    auditService.log({
      companyId: user.companyId,
      userId: user.id,
      action: 'escalation.created',
      entityType: 'escalation',
      entityId: escalation.id,
    })

    realtimeService.broadcast({
      type: 'escalation_created',
      payload: { escalation },
      userId: user.id,
      userName: user.name,
      companyId: user.companyId,
      timestamp: new Date().toISOString(),
    })

    return { escalation }
  },

  async updateStatus(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canEditShift(user), 'manage escalation')

    const body = await readBodyWithSchema(event, updateEscalationSchema)

    try {
      const escalation = escalationService.updateStatus(body.id, user.companyId, body.status)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: `escalation.${body.status}`,
        entityType: 'escalation',
        entityId: body.id,
      })

      return { escalation }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
