import type { H3Event } from 'h3'
import { dashboardService } from '../services/dashboardService'
import { insightsService } from '../services/insightsService'
import { permissionService } from '../services/permissionService'
import { requireAuth, requirePermission } from '../utils/auth'

export const dashboardController = {
  getStats(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewDashboard(user), 'view dashboard')
    const stats = dashboardService.getStats(user.companyId)
    return { stats }
  },

  getActivity(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewDashboard(user), 'view dashboard')
    const raw = dashboardService.getActivityFeed(user.companyId)
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
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewDashboard(user), 'view dashboard')
    const stats = dashboardService.getStats(user.companyId)
    const raw = dashboardService.getActivityFeed(user.companyId)
    const activities = raw.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description,
      timestamp: a.createdAt instanceof Date ? a.createdAt.toISOString() : new Date(a.createdAt).toISOString(),
      employeeId: a.employeeId,
    }))
    const insights = permissionService.canViewInsights(user)
      ? insightsService.generate(user.companyId)
      : []
    return { stats, activities, insights }
  },
}
