import { shiftModel } from '../models/shiftModel'
import { vehicleModel } from '../models/vehicleModel'
import { employeeModel } from '../models/employeeModel'
import { anomalyService } from './anomalyService'
import { predictionService } from './predictionService'

export interface Insight {
  id: string
  type: 'warning' | 'info' | 'success' | 'prediction'
  title: string
  description: string
  category?: string
}

export const insightsService = {
  generate(companyId: string): Insight[] {
    const insights: Insight[] = []
    const today = new Date().toISOString().split('T')[0]!
    const todayShifts = shiftModel.findByDate(today, companyId)
    const vehicles = vehicleModel.findAll(companyId)
    const employees = employeeModel.findAll(companyId)

    // check crew utilization
    const activeEmployees = employees.filter(e => e.status === 'active')
    const employeesWithShifts = new Set(todayShifts.map(s => s.employeeId))
    const utilization = activeEmployees.length > 0
      ? Math.round((employeesWithShifts.size / activeEmployees.length) * 100)
      : 0

    if (utilization < 50) {
      insights.push({
        id: 'low-utilization',
        type: 'warning',
        title: 'low crew utilization',
        description: `only ${utilization}% of active employees have shifts today. consider assigning more crew.`,
        category: 'staffing',
      })
    } else if (utilization >= 80) {
      insights.push({
        id: 'high-utilization',
        type: 'success',
        title: 'strong crew utilization',
        description: `${utilization}% of your crew is scheduled today. operations are running efficiently.`,
        category: 'staffing',
      })
    }

    // check shift overlaps
    const shiftsByEmployee = new Map<string, typeof todayShifts>()
    todayShifts.forEach(s => {
      const existing = shiftsByEmployee.get(s.employeeId) ?? []
      existing.push(s)
      shiftsByEmployee.set(s.employeeId, existing)
    })

    let overlapCount = 0
    shiftsByEmployee.forEach((empShifts) => {
      for (let i = 0; i < empShifts.length; i++) {
        for (let j = i + 1; j < empShifts.length; j++) {
          const a = empShifts[i]!
          const b = empShifts[j]!
          if (a.startTime < b.endTime && b.startTime < a.endTime) {
            overlapCount++
          }
        }
      }
    })

    if (overlapCount > 0) {
      insights.push({
        id: 'shift-overlaps',
        type: 'warning',
        title: `${overlapCount} shift overlap${overlapCount > 1 ? 's' : ''} detected`,
        description: 'some employees have overlapping shifts today. review the roster to resolve conflicts.',
        category: 'scheduling',
      })
    }

    // check vehicles in maintenance
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance')
    if (maintenanceVehicles.length >= 2) {
      insights.push({
        id: 'maintenance-load',
        type: 'info',
        title: `${maintenanceVehicles.length} vehicles in maintenance`,
        description: `${maintenanceVehicles.map(v => v.name).join(', ')} are currently unavailable. plan routes accordingly.`,
        category: 'fleet',
      })
    }

    // check cancelled shifts ratio
    const cancelledToday = todayShifts.filter(s => s.status === 'cancelled').length
    if (cancelledToday >= 2) {
      insights.push({
        id: 'high-cancellations',
        type: 'warning',
        title: `${cancelledToday} shifts cancelled today`,
        description: 'higher than usual cancellation rate. check if there are scheduling issues.',
        category: 'scheduling',
      })
    }

    // trend: compare today's shift count with recent average
    const trendInsight = this.detectTrend(companyId, today)
    if (trendInsight) insights.push(trendInsight)

    // anomaly-based insights
    const anomalies = anomalyService.detect(companyId)
    const highAnomalies = anomalies.filter(a => a.severity === 'high')
    if (highAnomalies.length > 0) {
      insights.push({
        id: 'critical-anomalies',
        type: 'warning',
        title: `${highAnomalies.length} critical issue${highAnomalies.length > 1 ? 's' : ''} detected`,
        description: highAnomalies.map(a => a.title).join('; '),
        category: 'anomaly',
      })
    }

    // prediction-based insights
    const predictions = predictionService.detectStaffingIssues(companyId)
    const understaffed = predictions.filter(p => p.type === 'understaffed')
    if (understaffed.length > 0) {
      insights.push({
        id: 'staffing-forecast',
        type: 'prediction',
        title: `understaffed on ${understaffed.length} upcoming day${understaffed.length > 1 ? 's' : ''}`,
        description: understaffed.map(p => p.title).join('; '),
        category: 'prediction',
      })
    }

    // if no issues, show positive insight
    if (insights.length === 0) {
      insights.push({
        id: 'all-clear',
        type: 'success',
        title: 'operations running smoothly',
        description: 'no issues detected. all systems normal.',
      })
    }

    return insights
  },

  // detect shift volume trends
  detectTrend(companyId: string, today: string): Insight | null {
    const recentDays: number[] = []
    for (let d = 1; d <= 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - d)
      const dateStr = date.toISOString().split('T')[0]!
      const dayShifts = shiftModel.findByDate(dateStr, companyId)
        .filter(s => s.status !== 'cancelled')
      recentDays.push(dayShifts.length)
    }

    if (recentDays.length === 0) return null

    const avg = recentDays.reduce((a, b) => a + b, 0) / recentDays.length
    const todayCount = shiftModel.findByDate(today, companyId)
      .filter(s => s.status !== 'cancelled').length

    if (avg > 0 && todayCount > avg * 1.5) {
      return {
        id: 'trend-increase',
        type: 'info',
        title: 'above-average shift volume',
        description: `${todayCount} active shifts today vs ${avg.toFixed(0)} daily average. busier than usual.`,
        category: 'trend',
      }
    }

    if (avg > 2 && todayCount < avg * 0.5) {
      return {
        id: 'trend-decrease',
        type: 'info',
        title: 'below-average shift volume',
        description: `${todayCount} active shifts today vs ${avg.toFixed(0)} daily average. quieter than usual.`,
        category: 'trend',
      }
    }

    return null
  },
}
