import type { H3Event } from 'h3'
import { z } from 'zod'
import { savedViewService } from '../services/savedViewService'
import { auditService } from '../services/auditService'
import { requireAuth } from '../utils/auth'
import { readBodyWithSchema, getParamsWithSchema, rethrowAsApiError } from '../utils/validation'

const filtersSchema = z.object({
  searchQuery: z.string().max(100).optional(),
  filterRole: z.string().max(40).optional(),
  filterStatus: z.string().max(40).optional(),
  sortField: z.string().max(40).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
}).strict()

const viewCreateSchema = z.object({
  name: z.string().min(1).max(60).trim(),
  filters: filtersSchema,
})

const paramsSchema = z.object({
  id: z.string().min(1),
})

export const savedViewController = {
  getViews(event: H3Event) {
    const user = requireAuth(event)
    const views = savedViewService.list(user.id, user.companyId)
    return { views }
  },

  async createView(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, viewCreateSchema)
    const view = savedViewService.createView(body, user.id, user.companyId)
    return { view }
  },

  removeView(event: H3Event) {
    const user = requireAuth(event)
    const { id } = getParamsWithSchema(event, paramsSchema)

    try {
      const result = savedViewService.removeView(id, user.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'saved_view.removed',
        entityType: 'saved_view',
        entityId: id,
      })

      return result
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
