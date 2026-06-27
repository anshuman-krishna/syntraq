import type { H3Event } from 'h3'
import { z } from 'zod'
import { searchService } from '../services/searchService'
import { permissionService } from '../services/permissionService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getQueryWithSchema } from '../utils/validation'

const searchQuerySchema = z.object({
  q: z.string().max(100).optional(),
})

export const searchController = {
  getResults(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'search')

    const { q } = getQueryWithSchema(event, searchQuerySchema)
    const results = searchService.search(user.companyId, q ?? '')
    return { results }
  },
}
