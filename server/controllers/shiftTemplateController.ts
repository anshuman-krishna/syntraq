import type { H3Event } from 'h3'
import { z } from 'zod'
import { shiftTemplateService } from '../services/shiftTemplateService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const templateCreateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  employeeId: z.string().min(1),
  vehicleId: z.string().nullable().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
})

const applySchema = z.object({
  id: z.string().min(1),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const removeSchema = z.object({
  id: z.string().min(1),
})

export const shiftTemplateController = {
  getTemplates(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view templates')
    return shiftTemplateService.getOverview(user.companyId)
  },

  async createTemplate(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canCreateShift(user), 'manage templates')
    const body = await readBodyWithSchema(event, templateCreateSchema)

    try {
      const template = shiftTemplateService.createTemplate(body, user.companyId, user.id)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'shift_template.created',
        entityType: 'shift_template',
        entityId: template.id,
      })

      return { template }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async applyTemplate(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canCreateShift(user), 'apply templates')
    const body = await readBodyWithSchema(event, applySchema)

    try {
      const shifts = shiftTemplateService.applyTemplate(body.id, body.weekStart, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'shift_template.applied',
        entityType: 'shift_template',
        entityId: body.id,
      })

      return { shifts }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async removeTemplate(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canCreateShift(user), 'manage templates')
    const body = await readBodyWithSchema(event, removeSchema)

    try {
      const result = shiftTemplateService.removeTemplate(body.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'shift_template.removed',
        entityType: 'shift_template',
        entityId: body.id,
      })

      return result
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
