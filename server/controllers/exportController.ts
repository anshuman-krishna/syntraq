import { setHeader, type H3Event } from 'h3'
import { z } from 'zod'
import { exportService, type ExportEntity } from '../services/exportService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getParamsWithSchema, getQueryWithSchema } from '../utils/validation'
import type { AuthContext } from '../utils/auth'

const paramsSchema = z.object({
  entity: z.enum(['shifts', 'employees', 'vehicles', 'audit']),
})

const querySchema = z.object({
  format: z.enum(['csv', 'json']).optional(),
})

// audit is admin-only; operational data follows the roster read permission
function canExport(user: AuthContext, entity: ExportEntity): boolean {
  if (entity === 'audit') return permissionService.canViewAuditLog(user)
  return permissionService.canViewRoster(user)
}

export const exportController = {
  download(event: H3Event) {
    const user = requireAuth(event)
    const { entity } = getParamsWithSchema(event, paramsSchema)
    requirePermission(user, canExport(user, entity), `export ${entity}`)

    const { format } = getQueryWithSchema(event, querySchema)
    const result = exportService.build(entity, user.companyId, format ?? 'csv')

    auditService.log({
      companyId: user.companyId,
      userId: user.id,
      action: 'data.exported',
      entityType: entity,
    })

    setHeader(event, 'content-type', result.contentType)
    setHeader(event, 'content-disposition', `attachment; filename="${result.filename}"`)
    return result.content
  },
}
