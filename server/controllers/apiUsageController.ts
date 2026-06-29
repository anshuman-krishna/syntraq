import type { H3Event } from 'h3'
import { z } from 'zod'
import { apiUsageService } from '../services/apiUsageService'
import { permissionService } from '../services/permissionService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getQueryWithSchema } from '../utils/validation'

const summaryQuerySchema = z.object({
  hours: z.coerce.number().int().min(1).max(168).default(24),
})

export const apiUsageController = {
  getSummary(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'view api usage')

    const { hours } = getQueryWithSchema(event, summaryQuerySchema)
    const summary = apiUsageService.summary(user.companyId, hours)
    return { summary }
  },
}
