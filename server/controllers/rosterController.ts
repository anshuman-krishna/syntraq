import type { H3Event } from 'h3'
import { rosterService } from '../services/rosterService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { realtimeService } from '../services/realtimeService'
import { usageService } from '../services/usageService'
import { AppError } from '../services/authService'
import { requireAuth, requirePermission } from '../utils/auth'
import { shiftUpdateSchema, shiftCreateSchema } from '../../shared/utils/validation'

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
    const body = await readBody(event)
    const parsed = shiftUpdateSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.issues[0].message })
    }

    try {
      const shift = rosterService.updateShift(parsed.data, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'shift.updated',
        entityType: 'shift',
        entityId: parsed.data.id,
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
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async createShift(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canCreateShift(user), 'create shift')
    usageService.checkShiftLimit(user.companyId)

    const body = await readBody(event)
    const parsed = shiftCreateSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.issues[0].message })
    }

    try {
      const shift = rosterService.createShift(parsed.data, user.companyId)

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
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },
}
