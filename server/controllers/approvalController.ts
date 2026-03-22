import type { H3Event } from 'h3'
import { approvalService } from '../services/approvalService'
import { realtimeService } from '../services/realtimeService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { AppError } from '../services/authService'

export const approvalController = {
  getApprovals(event: H3Event) {
    const user = requireAuth(event)
    const query = getQuery(event)
    const mine = query.mine === 'true'

    const approvals = mine
      ? approvalService.getPending(user.companyId, user.id)
      : approvalService.getAll(user.companyId)

    return { approvals }
  },

  async requestApproval(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    const entityType = typeof body?.entityType === 'string' ? body.entityType : ''
    const entityId = typeof body?.entityId === 'string' ? body.entityId : ''
    const assignedTo = typeof body?.assignedTo === 'string' ? body.assignedTo : ''
    const note = typeof body?.note === 'string' ? body.note : undefined

    if (!entityType || !entityId || !assignedTo) {
      throw createError({ statusCode: 400, message: 'entityType, entityId, and assignedTo required' })
    }

    const approval = approvalService.requestApproval({
      entityType,
      entityId,
      requestedBy: user.id,
      assignedTo,
      companyId: user.companyId,
      note,
    })

    realtimeService.broadcast({
      type: 'approval_created',
      payload: { approval },
      userId: user.id,
      userName: user.name,
      companyId: user.companyId,
      timestamp: new Date().toISOString(),
    })

    return { approval }
  },

  async resolveApproval(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canEditShift(user), 'resolve approval')

    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''
    const status = body?.status === 'approved' || body?.status === 'rejected' ? body.status : null
    const note = typeof body?.note === 'string' ? body.note : undefined

    if (!id || !status) {
      throw createError({ statusCode: 400, message: 'id and status (approved/rejected) required' })
    }

    try {
      const approval = approvalService.resolve(id, user.companyId, status, note)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: `approval.${status}`,
        entityType: 'approval',
        entityId: id,
      })

      realtimeService.broadcast({
        type: 'approval_updated',
        payload: { approval },
        userId: user.id,
        userName: user.name,
        companyId: user.companyId,
        timestamp: new Date().toISOString(),
      })

      return { approval }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },
}
