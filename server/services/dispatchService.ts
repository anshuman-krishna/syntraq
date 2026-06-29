import { shiftModel } from '../models/shiftModel'
import { employeeModel } from '../models/employeeModel'
import { vehicleModel } from '../models/vehicleModel'
import { AppError } from './authService'

interface BoardShift {
  id: string
  employeeId: string
  employeeName: string
  vehicleId: string | null
  startTime: string
  endTime: string
  status: string
}

function byStartTime(a: BoardShift, b: BoardShift) {
  return a.startTime.localeCompare(b.startTime)
}

export const dispatchService = {
  // a vehicle-centric view of one day's shifts: shifts grouped under the
  // vehicle they're assigned to, plus an unassigned bucket to dispatch from.
  getBoard(companyId: string, date: string) {
    const employees = employeeModel.findAll(companyId)
    const vehicles = vehicleModel.findAll(companyId)
    const empNames = new Map(employees.map(e => [e.id, e.name]))

    const shifts: BoardShift[] = shiftModel.findByDate(date, companyId)
      .filter(s => s.status !== 'cancelled')
      .map(s => ({
        id: s.id,
        employeeId: s.employeeId,
        employeeName: empNames.get(s.employeeId) ?? 'unknown',
        vehicleId: s.vehicleId,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
      }))

    const assignments = vehicles.map(v => ({
      vehicleId: v.id,
      vehicleName: v.name,
      vehicleStatus: v.status,
      shifts: shifts.filter(s => s.vehicleId === v.id).sort(byStartTime),
    }))

    const unassigned = shifts.filter(s => !s.vehicleId).sort(byStartTime)

    return {
      date,
      assignments,
      unassigned,
      vehicles: vehicles.map(v => ({ id: v.id, name: v.name, status: v.status })),
    }
  },

  // assign or clear (vehicleId = null) a vehicle on a shift. rejects a vehicle
  // that already covers an overlapping shift the same day.
  assignVehicle(shiftId: string, vehicleId: string | null, companyId: string) {
    const shift = shiftModel.findById(shiftId, companyId)
    if (!shift) throw new AppError('shift not found', 404)

    if (vehicleId) {
      const vehicle = vehicleModel.findById(vehicleId, companyId)
      if (!vehicle) throw new AppError('vehicle not found', 404)

      const conflict = shiftModel.findByDate(shift.date, companyId).find(s =>
        s.id !== shiftId
        && s.vehicleId === vehicleId
        && s.status !== 'cancelled'
        && shift.startTime < s.endTime
        && s.startTime < shift.endTime,
      )
      if (conflict) throw new AppError('vehicle is already assigned to an overlapping shift', 409)
    }

    return shiftModel.update(shiftId, companyId, { vehicleId })
  },
}
