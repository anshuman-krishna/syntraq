import { shiftModel } from '../models/shiftModel'
import { vehicleModel } from '../models/vehicleModel'
import { activityModel } from '../models/activityModel'
import { cacheService } from './cacheService'

const STATS_TTL = 30 * 1000 // 30 seconds
const ACTIVITY_TTL = 15 * 1000 // 15 seconds

export const dashboardService = {
  getStats(companyId: string) {
    const cacheKey = `dashboard:stats:${companyId}`
    const cached = cacheService.get<ReturnType<typeof this.computeStats>>(cacheKey)
    if (cached) return cached

    const stats = this.computeStats(companyId)
    cacheService.set(cacheKey, stats, STATS_TTL)
    return stats
  },

  computeStats(companyId: string) {
    const today = new Date().toISOString().split('T')[0]!
    const todayShifts = shiftModel.findByDate(today, companyId)
    const vehicles = vehicleModel.findAll(companyId)

    const activeShifts = todayShifts.filter(s => s.status === 'active').length
    const scheduledShifts = todayShifts.filter(s => s.status === 'scheduled').length
    const onRoute = vehicles.filter(v => v.status === 'on-route').length
    const available = vehicles.filter(v => v.status === 'available').length
    const inMaintenance = vehicles.filter(v => v.status === 'maintenance').length

    return {
      activeDrivers: activeShifts + scheduledShifts,
      dispatchedToday: todayShifts.length,
      pendingInspections: Math.max(2, Math.floor(vehicles.length * 0.3)),
      fleetUtilization: vehicles.length > 0 ? Math.round((onRoute / vehicles.length) * 100) : 0,
      onRoute,
      available,
      inMaintenance,
      totalVehicles: vehicles.length,
    }
  },

  getActivityFeed(companyId: string, limit = 10) {
    const cacheKey = `dashboard:activity:${companyId}:${limit}`
    const cached = cacheService.get<ReturnType<typeof activityModel.findRecent>>(cacheKey)
    if (cached) return cached

    const activities = activityModel.findRecent(companyId, limit)
    cacheService.set(cacheKey, activities, ACTIVITY_TTL)
    return activities
  },
}
