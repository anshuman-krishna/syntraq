import { generateId } from '../../shared/utils/id'
import { employeeModel } from '../models/employeeModel'
import { shiftModel } from '../models/shiftModel'
import { activityModel } from '../models/activityModel'
import { AppError } from './authService'
import type { ShiftUpdateInput, ShiftCreateInput } from '../../shared/utils/validation'

export const rosterService = {
  getEmployees() {
    return employeeModel.findAll()
  },

  getShifts() {
    return shiftModel.findAll()
  },

  getShiftsByEmployee(employeeId: string) {
    return shiftModel.findByEmployeeId(employeeId)
  },

  updateShift(input: ShiftUpdateInput) {
    const existing = shiftModel.findById(input.id)
    if (!existing) {
      throw new AppError('shift not found', 404)
    }

    const { id, ...updateData } = input
    const updated = shiftModel.update(id, updateData)

    const employee = employeeModel.findById(existing.employeeId)
    activityModel.create({
      id: generateId(),
      type: 'shift_updated',
      description: `shift updated for ${employee?.name ?? 'unknown'} on ${existing.date}`,
      employeeId: existing.employeeId,
    })

    return updated
  },

  createShift(input: ShiftCreateInput) {
    const employee = employeeModel.findById(input.employeeId)
    if (!employee) {
      throw new AppError('employee not found', 404)
    }

    const id = generateId()
    const shift = shiftModel.create({ id, ...input })

    activityModel.create({
      id: generateId(),
      type: 'shift_created',
      description: `shift created for ${employee.name} on ${input.date}`,
      employeeId: input.employeeId,
    })

    return shift
  },
}
