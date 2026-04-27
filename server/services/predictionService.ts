import { shiftModel } from '../models/shiftModel'
import { employeeModel } from '../models/employeeModel'
import { vehicleModel } from '../models/vehicleModel'

export interface ShiftPrediction {
  type: 'optimal_assignment' | 'understaffed' | 'overstaffed' | 'pattern_match'
  confidence: number
  title: string
  description: string
  suggestion?: string
  employeeId?: string
  date?: string
}

interface EmployeePattern {
  employeeId: string
  name: string
  avgShiftsPerWeek: number
  preferredStartHour: number
  preferredDuration: number
  mostFrequentVehicle: string | null
  completionRate: number
  cancellationRate: number
}

function parseHour(time: string): number {
  return parseInt(time.split(':')[0]!, 10)
}

function getWeekNumber(date: string): number {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}

export const predictionService = {
  // analyze historical shift patterns per employee
  analyzePatterns(companyId: string): EmployeePattern[] {
    const employees = employeeModel.findAll(companyId)
    const allShifts = shiftModel.findAll(companyId)
    const patterns: EmployeePattern[] = []

    for (const emp of employees) {
      if (emp.status !== 'active') continue

      const empShifts = allShifts.filter(s => s.employeeId === emp.id)
      if (empShifts.length === 0) {
        patterns.push({
          employeeId: emp.id,
          name: emp.name,
          avgShiftsPerWeek: 0,
          preferredStartHour: 8,
          preferredDuration: 8,
          mostFrequentVehicle: null,
          completionRate: 0,
          cancellationRate: 0,
        })
        continue
      }

      // calculate weekly frequency
      const weeks = new Set(empShifts.map(s => getWeekNumber(s.date)))
      const avgShiftsPerWeek = empShifts.length / Math.max(weeks.size, 1)

      // preferred start time
      const startHours = empShifts.map(s => parseHour(s.startTime))
      const preferredStartHour = Math.round(startHours.reduce((a, b) => a + b, 0) / startHours.length)

      // preferred duration
      const durations = empShifts.map(s => parseHour(s.endTime) - parseHour(s.startTime))
      const preferredDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)

      // most frequent vehicle
      const vehicleCounts = new Map<string, number>()
      empShifts.forEach(s => {
        if (s.vehicleId) {
          vehicleCounts.set(s.vehicleId, (vehicleCounts.get(s.vehicleId) ?? 0) + 1)
        }
      })
      let mostFrequentVehicle: string | null = null
      let maxCount = 0
      vehicleCounts.forEach((count, vid) => {
        if (count > maxCount) {
          mostFrequentVehicle = vid
          maxCount = count
        }
      })

      // completion and cancellation rates
      const completed = empShifts.filter(s => s.status === 'completed').length
      const cancelled = empShifts.filter(s => s.status === 'cancelled').length
      const completionRate = completed / empShifts.length
      const cancellationRate = cancelled / empShifts.length

      patterns.push({
        employeeId: emp.id,
        name: emp.name,
        avgShiftsPerWeek,
        preferredStartHour,
        preferredDuration,
        mostFrequentVehicle,
        completionRate,
        cancellationRate,
      })
    }

    return patterns
  },

  // suggest optimal shift assignments for a given date
  suggestAssignments(companyId: string, date: string): ShiftPrediction[] {
    const predictions: ShiftPrediction[] = []
    const patterns = this.analyzePatterns(companyId)
    const dateShifts = shiftModel.findByDate(date, companyId)
    const assignedEmployees = new Set(dateShifts.map(s => s.employeeId))
    const vehicles = vehicleModel.findAll(companyId)

    // find unassigned employees with high completion rates
    const unassigned = patterns
      .filter(p => !assignedEmployees.has(p.employeeId) && p.avgShiftsPerWeek > 0)
      .sort((a, b) => b.completionRate - a.completionRate)

    for (const emp of unassigned.slice(0, 3)) {
      const preferredVehicle = vehicles.find(v => v.id === emp.mostFrequentVehicle)
      predictions.push({
        type: 'optimal_assignment',
        confidence: Math.round(emp.completionRate * 100),
        title: `assign ${emp.name}`,
        description: `${emp.name} typically works ${emp.avgShiftsPerWeek.toFixed(1)} shifts/week starting at ${String(emp.preferredStartHour).padStart(2, '0')}:00`,
        suggestion: preferredVehicle
          ? `suggest ${preferredVehicle.name} (${emp.preferredStartHour}:00-${emp.preferredStartHour + emp.preferredDuration}:00)`
          : `suggest ${String(emp.preferredStartHour).padStart(2, '0')}:00-${String(emp.preferredStartHour + emp.preferredDuration).padStart(2, '0')}:00`,
        employeeId: emp.employeeId,
        date,
      })
    }

    return predictions
  },

  // detect staffing level issues
  detectStaffingIssues(companyId: string): ShiftPrediction[] {
    const predictions: ShiftPrediction[] = []
    const employees = employeeModel.findAll(companyId).filter(e => e.status === 'active')
    const today = new Date()

    // check next 5 days
    for (let d = 0; d <= 4; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]!
      const dayShifts = shiftModel.findByDate(dateStr, companyId)
        .filter(s => s.status !== 'cancelled')

      const utilization = employees.length > 0
        ? dayShifts.length / employees.length
        : 0

      if (utilization < 0.3 && d > 0) {
        predictions.push({
          type: 'understaffed',
          confidence: Math.round((1 - utilization) * 80),
          title: `low coverage on ${dateStr}`,
          description: `only ${dayShifts.length} of ${employees.length} active employees scheduled. consider adding shifts.`,
          date: dateStr,
        })
      }

      if (utilization > 1.2) {
        predictions.push({
          type: 'overstaffed',
          confidence: Math.round(utilization * 60),
          title: `possible overstaffing on ${dateStr}`,
          description: `${dayShifts.length} shifts for ${employees.length} employees. some may have multiple assignments.`,
          date: dateStr,
        })
      }
    }

    return predictions
  },

  // get all predictions combined
  getPredictions(companyId: string, date?: string): ShiftPrediction[] {
    const targetDate = date ?? new Date().toISOString().split('T')[0]!
    const assignments = this.suggestAssignments(companyId, targetDate)
    const staffing = this.detectStaffingIssues(companyId)
    return [...assignments, ...staffing].sort((a, b) => b.confidence - a.confidence)
  },
}
