import type { H3Event } from 'h3'
import { z } from 'zod'
import { approvalService } from '../services/approvalService'
import { realtimeService } from '../services/realtimeService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getQueryWithSchema, readBodyWithSchema, rethrowAsApiError } from '../utils/validation'
import { permissionService } from '../services/permissionService'

const approvalsQuerySchema = z.object({
  mine: z.enum(['true', 'false']).optional(),
})

const requestApprovalSchema = z.object({
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1),
  assignedTo: z.string().trim().min(1),
  note: z.string().trim().max(1000).optional(),
})

const resolveApprovalSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(1000).optional(),
})

export const approvalController = {
  getApprovals(event: H3Event) {
    const user = requireAuth(event)
    const query = getQueryWithSchema(event, approvalsQuerySchema)
    const mine = query.mine === 'true'

    const approvals = mine
      ? approvalService.getPending(user.companyId, user.id)
      : approvalService.getAll(user.companyId)

    return { approvals }
  },

  async requestApproval(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, requestApprovalSchema)

    const approval = approvalService.requestApproval({
      entityType: body.entityType,
      entityId: body.entityId,
      requestedBy: user.id,
      assignedTo: body.assignedTo,
      companyId: user.companyId,
      note: body.note,
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

    const body = await readBodyWithSchema(event, resolveApprovalSchema)

    try {
      const approval = approvalService.resolve(body.id, user.companyId, body.status, body.note)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: `approval.${body.status}`,
        entityType: 'approval',
        entityId: body.id,
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
      rethrowAsApiError(e, event)
    }
  },
}
