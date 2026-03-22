import { shiftModel } from '../models/shiftModel'
import { vehicleModel } from '../models/vehicleModel'
import { employeeModel } from '../models/employeeModel'

export interface Insight {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
}

export const insightsService = {
  generate(companyId: string): Insight[] {
    const insights: Insight[] = []
    const today = new Date().toISOString().split('T')[0]
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
      })
    } else if (utilization >= 80) {
      insights.push({
        id: 'high-utilization',
        type: 'success',
        title: 'strong crew utilization',
        description: `${utilization}% of your crew is scheduled today. operations are running efficiently.`,
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
          const a = empShifts[i]
          const b = empShifts[j]
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
}
