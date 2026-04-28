import type { H3Event } from 'h3'
import { z } from 'zod'
import { auditService } from '../services/auditService'
import { permissionService } from '../services/permissionService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getQueryWithSchema } from '../utils/validation'

const auditQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
})

export const auditController = {
  getLogs(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewAuditLog(user), 'view audit logs')

    const query = getQueryWithSchema(event, auditQuerySchema)
    const limit = query.limit ?? 50

    const logs = auditService.getCompanyLogs(user.companyId, limit)
    return { logs }
  },
}
