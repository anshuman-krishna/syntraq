import type { H3Event } from 'h3'
import { escalationService } from '../services/escalationService'
import { realtimeService } from '../services/realtimeService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { AppError } from '../services/authService'

export const escalationController = {
  getEscalations(event: H3Event) {
    const user = requireAuth(event)
    const query = getQuery(event)
    const openOnly = query.open === 'true'

    const escalations = openOnly
      ? escalationService.getOpen(user.companyId)
      : escalationService.getAll(user.companyId)

    return { escalations }
  },

  async createEscalation(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    const entityType = typeof body?.entityType === 'string' ? body.entityType : ''
    const entityId = typeof body?.entityId === 'string' ? body.entityId : ''
    const assignedTo = typeof body?.assignedTo === 'string' ? body.assignedTo : ''
    const priority = ['low', 'medium', 'high', 'critical'].includes(body?.priority) ? body.priority : 'medium'
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''

    if (!entityType || !entityId || !assignedTo || !reason) {
      throw createError({ statusCode: 400, message: 'entityType, entityId, assignedTo, and reason required' })
    }

    const escalation = escalationService.create({
      entityType,
      entityId,
      createdBy: user.id,
      assignedTo,
      priority,
      reason,
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

    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''
    const status = body?.status === 'acknowledged' || body?.status === 'resolved' ? body.status : null

    if (!id || !status) {
      throw createError({ statusCode: 400, message: 'id and status (acknowledged/resolved) required' })
    }

    try {
      const escalation = escalationService.updateStatus(id, user.companyId, status)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: `escalation.${status}`,
        entityType: 'escalation',
        entityId: id,
      })

      return { escalation }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },
}
