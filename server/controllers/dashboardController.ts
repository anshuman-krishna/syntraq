import type { H3Event } from 'h3'
import { dashboardService } from '../services/dashboardService'

function requireAuth(event: H3Event) {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: 'not authenticated' })
  }
}

export const dashboardController = {
  getStats(event: H3Event) {
    requireAuth(event)
    const stats = dashboardService.getStats()
    return { stats }
  },

  getActivity(event: H3Event) {
    requireAuth(event)
    const raw = dashboardService.getActivityFeed()
    const activities = raw.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description,
      timestamp: a.createdAt instanceof Date ? a.createdAt.toISOString() : new Date(a.createdAt).toISOString(),
      employeeId: a.employeeId,
    }))
    return { activities }
  },

  getOverview(event: H3Event) {
    requireAuth(event)
    const stats = dashboardService.getStats()
    const raw = dashboardService.getActivityFeed()
    const activities = raw.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description,
      timestamp: a.createdAt instanceof Date ? a.createdAt.toISOString() : new Date(a.createdAt).toISOString(),
      employeeId: a.employeeId,
    }))
    return { stats, activities }
  },
}
