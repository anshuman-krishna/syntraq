import type { H3Event } from 'h3'
import { rosterService } from '../services/rosterService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { realtimeService } from '../services/realtimeService'
import { usageService } from '../services/usageService'
import { requireAuth, requirePermission } from '../utils/auth'
import { shiftUpdateSchema, shiftCreateSchema } from '../../shared/utils/validation'
import { readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

export const rosterController = {
  getEmployees(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view roster')
    const employees = rosterService.getEmployees(user.companyId)
    return { employees }
  },

  getShifts(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view roster')
    const shifts = rosterService.getShifts(user.companyId)
    return { shifts }
  },

  getRoster(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view roster')
    const employees = rosterService.getEmployees(user.companyId)
    const shifts = rosterService.getShifts(user.companyId)
    return { employees, shifts }
  },

  async updateShift(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canEditShift(user), 'edit shift')
    const body = await readBodyWithSchema(event, shiftUpdateSchema)

    try {
      const shift = rosterService.updateShift(body, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'shift.updated',
        entityType: 'shift',
        entityId: body.id,
      })

      realtimeService.broadcast({
        type: 'shift_updated',
        payload: { shift },
        userId: user.id,
        userName: user.name,
        companyId: user.companyId,
        timestamp: new Date().toISOString(),
      })

      return { shift }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async createShift(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canCreateShift(user), 'create shift')
    usageService.checkShiftLimit(user.companyId)

    const body = await readBodyWithSchema(event, shiftCreateSchema)

    try {
      const shift = rosterService.createShift(body, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'shift.created',
        entityType: 'shift',
        entityId: shift.id,
      })

      realtimeService.broadcast({
        type: 'shift_created',
        payload: { shift },
        userId: user.id,
        userName: user.name,
        companyId: user.companyId,
        timestamp: new Date().toISOString(),
      })

      return { shift }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
