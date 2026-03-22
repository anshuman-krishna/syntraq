import { shiftModel } from '../models/shiftModel'
import { employeeModel } from '../models/employeeModel'
import { vehicleModel } from '../models/vehicleModel'

export interface Anomaly {
  id: string
  type: 'overlap' | 'idle_employee' | 'excessive_hours' | 'double_booking' | 'no_vehicle' | 'pattern_break'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  entityId?: string
  entityType?: string
  date?: string
}

function parseHour(time: string): number {
  return parseInt(time.split(':')[0]!, 10)
}

let anomalyCounter = 0
function nextId(): string {
  return `anomaly-${++anomalyCounter}`
}

export const anomalyService = {
  // detect all anomalies for a company
  detect(companyId: string): Anomaly[] {
    const anomalies: Anomaly[] = []
    anomalyCounter = 0

    anomalies.push(...this.detectOverlaps(companyId))
    anomalies.push(...this.detectIdleEmployees(companyId))
    anomalies.push(...this.detectExcessiveHours(companyId))
    anomalies.push(...this.detectVehicleConflicts(companyId))
    anomalies.push(...this.detectPatternBreaks(companyId))

    return anomalies
  },

  // find overlapping shifts for same employee
  detectOverlaps(companyId: string): Anomaly[] {
    const anomalies: Anomaly[] = []
    const today = new Date().toISOString().split('T')[0]!

    // check today and next 3 days
    for (let d = 0; d <= 3; d++) {
      const date = new Date()
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]!
      const shifts = shiftModel.findByDate(dateStr, companyId)
        .filter(s => s.status !== 'cancelled')

      // group by employee
      const byEmployee = new Map<string, typeof shifts>()
      shifts.forEach(s => {
        const existing = byEmployee.get(s.employeeId) ?? []
        existing.push(s)
        byEmployee.set(s.employeeId, existing)
      })

      byEmployee.forEach((empShifts, empId) => {
        for (let i = 0; i < empShifts.length; i++) {
          for (let j = i + 1; j < empShifts.length; j++) {
            const a = empShifts[i]!
            const b = empShifts[j]!
            if (a.startTime < b.endTime && b.startTime < a.endTime) {
              const employees = employeeModel.findAll(companyId)
              const emp = employees.find(e => e.id === empId)
              anomalies.push({
                id: nextId(),
                type: 'overlap',
                severity: dateStr === today ? 'high' : 'medium',
                title: `shift overlap: ${emp?.name ?? empId}`,
                description: `${a.startTime}-${a.endTime} overlaps with ${b.startTime}-${b.endTime} on ${dateStr}`,
                entityId: empId,
                entityType: 'employee',
                date: dateStr,
              })
            }
          }
        }
      })
    }

    return anomalies
  },

  // find active employees with no shifts in upcoming days
  detectIdleEmployees(companyId: string): Anomaly[] {
    const anomalies: Anomaly[] = []
    const employees = employeeModel.findAll(companyId).filter(e => e.status === 'active')

    // check next 3 days
    const upcomingDates: string[] = []
    for (let d = 0; d <= 2; d++) {
      const date = new Date()
      date.setDate(date.getDate() + d)
      upcomingDates.push(date.toISOString().split('T')[0]!)
    }

    const allUpcomingShifts = upcomingDates.flatMap(date =>
      shiftModel.findByDate(date, companyId).filter(s => s.status !== 'cancelled')
    )
    const scheduledEmployees = new Set(allUpcomingShifts.map(s => s.employeeId))

    const idleEmployees = employees.filter(e => !scheduledEmployees.has(e.id))

    if (idleEmployees.length > 0 && idleEmployees.length <= employees.length * 0.5) {
      idleEmployees.forEach(emp => {
        anomalies.push({
          id: nextId(),
          type: 'idle_employee',
          severity: 'low',
          title: `${emp.name} has no upcoming shifts`,
          description: `no shifts scheduled in the next 3 days. consider assigning work or verifying availability.`,
          entityId: emp.id,
          entityType: 'employee',
        })
      })
    }

    return anomalies
  },

  // detect employees with excessive hours
  detectExcessiveHours(companyId: string): Anomaly[] {
    const anomalies: Anomaly[] = []
    const employees = employeeModel.findAll(companyId).filter(e => e.status === 'active')

    // check current week (mon-sun)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

    const weekDates: string[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + d)
      weekDates.push(date.toISOString().split('T')[0]!)
    }

    for (const emp of employees) {
      let totalHours = 0
      for (const date of weekDates) {
        const shifts = shiftModel.findByDate(date, companyId)
          .filter(s => s.employeeId === emp.id && s.status !== 'cancelled')
        for (const shift of shifts) {
          totalHours += parseHour(shift.endTime) - parseHour(shift.startTime)
        }
      }

      if (totalHours > 50) {
        anomalies.push({
          id: nextId(),
          type: 'excessive_hours',
          severity: totalHours > 60 ? 'high' : 'medium',
          title: `${emp.name}: ${totalHours}h this week`,
          description: `exceeds recommended 50-hour weekly limit. risk of fatigue and compliance issues.`,
          entityId: emp.id,
          entityType: 'employee',
        })
      }
    }

    return anomalies
  },

  // detect vehicles assigned to multiple simultaneous shifts
  detectVehicleConflicts(companyId: string): Anomaly[] {
    const anomalies: Anomaly[] = []
    const vehicles = vehicleModel.findAll(companyId)
    const today = new Date().toISOString().split('T')[0]!

    for (let d = 0; d <= 2; d++) {
      const date = new Date()
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]!
      const shifts = shiftModel.findByDate(dateStr, companyId)
        .filter(s => s.status !== 'cancelled' && s.vehicleId)

      // group by vehicle
      const byVehicle = new Map<string, typeof shifts>()
      shifts.forEach(s => {
        if (!s.vehicleId) return
        const existing = byVehicle.get(s.vehicleId) ?? []
        existing.push(s)
        byVehicle.set(s.vehicleId, existing)
      })

      byVehicle.forEach((vehShifts, vehicleId) => {
        for (let i = 0; i < vehShifts.length; i++) {
          for (let j = i + 1; j < vehShifts.length; j++) {
            const a = vehShifts[i]!
            const b = vehShifts[j]!
            if (a.startTime < b.endTime && b.startTime < a.endTime) {
              const vehicle = vehicles.find(v => v.id === vehicleId)
              anomalies.push({
                id: nextId(),
                type: 'double_booking',
                severity: dateStr === today ? 'high' : 'medium',
                title: `vehicle conflict: ${vehicle?.name ?? vehicleId}`,
                description: `double-booked on ${dateStr}: ${a.startTime}-${a.endTime} and ${b.startTime}-${b.endTime}`,
                entityId: vehicleId,
                entityType: 'vehicle',
                date: dateStr,
              })
            }
          }
        }
      })
    }

    return anomalies
  },

  // detect pattern breaks (employees with unusually different schedule)
  detectPatternBreaks(companyId: string): Anomaly[] {
    const anomalies: Anomaly[] = []
    const employees = employeeModel.findAll(companyId).filter(e => e.status === 'active')
    const allShifts = shiftModel.findAll(companyId)

    for (const emp of employees) {
      const empShifts = allShifts.filter(s => s.employeeId === emp.id && s.status !== 'cancelled')
      if (empShifts.length < 5) continue

      // check if cancellation rate is unusually high
      const cancelled = allShifts.filter(s => s.employeeId === emp.id && s.status === 'cancelled').length
      const total = allShifts.filter(s => s.employeeId === emp.id).length
      const cancelRate = cancelled / total

      if (cancelRate > 0.4) {
        anomalies.push({
          id: nextId(),
          type: 'pattern_break',
          severity: 'medium',
          title: `high cancellation rate: ${emp.name}`,
          description: `${Math.round(cancelRate * 100)}% of shifts cancelled. may indicate scheduling or availability issues.`,
          entityId: emp.id,
          entityType: 'employee',
        })
      }
    }

    return anomalies
  },

  // get anomalies filtered by severity
  getBySeverity(companyId: string, severity?: string): Anomaly[] {
    const all = this.detect(companyId)
    if (!severity) return all
    return all.filter(a => a.severity === severity)
  },
}
