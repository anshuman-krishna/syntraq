import type { H3Event } from 'h3'
import { z } from 'zod'
import { maintenanceService } from '../services/maintenanceService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const recordCreateSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.enum(['service', 'inspection', 'repair']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  odometer: z.number().int().min(0).nullable().optional(),
  // dollars in, stored as cents by the client before submit
  cost: z.number().int().min(0).nullable().optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed']).optional(),
  notes: z.string().max(500).nullable().optional(),
})

export const maintenanceController = {
  getRecords(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewMaintenance(user), 'view maintenance')
    return maintenanceService.getOverview(user.companyId)
  },

  async createRecord(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageMaintenance(user), 'manage maintenance')
    const body = await readBodyWithSchema(event, recordCreateSchema)

    try {
      const record = maintenanceService.createRecord(body, user.companyId, user.id)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'maintenance.created',
        entityType: 'maintenance_record',
        entityId: record.id,
      })

      return { record }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
