import type { H3Event } from 'h3'
import { z } from 'zod'
import { dispatchService } from '../services/dispatchService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getQueryWithSchema, readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const boardQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const assignSchema = z.object({
  shiftId: z.string().min(1),
  vehicleId: z.string().min(1).nullable(),
})

function today(): string {
  return new Date().toISOString().split('T')[0]!
}

export const dispatchController = {
  getBoard(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view dispatch')

    const { date } = getQueryWithSchema(event, boardQuerySchema)
    return dispatchService.getBoard(user.companyId, date ?? today())
  },

  async assign(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canEditShift(user), 'assign dispatch')

    const body = await readBodyWithSchema(event, assignSchema)

    try {
      const shift = dispatchService.assignVehicle(body.shiftId, body.vehicleId, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: body.vehicleId ? 'dispatch.assigned' : 'dispatch.unassigned',
        entityType: 'shift',
        entityId: body.shiftId,
        metadata: { vehicleId: body.vehicleId },
      })

      return { shift }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
