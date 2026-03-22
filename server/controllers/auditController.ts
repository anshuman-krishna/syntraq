import type { H3Event } from 'h3'
import { auditService } from '../services/auditService'
import { permissionService } from '../services/permissionService'
import { requireAuth, requirePermission } from '../utils/auth'

export const auditController = {
  getLogs(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewAuditLog(user), 'view audit logs')

    const query = getQuery(event)
    const limit = Math.min(Number(query.limit) || 50, 200)

    const logs = auditService.getCompanyLogs(user.companyId, limit)
    return { logs }
  },
}
