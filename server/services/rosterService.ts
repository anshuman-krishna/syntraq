import { generateId } from '../../shared/utils/id'
import { employeeModel } from '../models/employeeModel'
import { shiftModel } from '../models/shiftModel'
import { activityModel } from '../models/activityModel'
import { AppError } from './authService'
import type { ShiftUpdateInput, ShiftCreateInput } from '../../shared/utils/validation'

export const rosterService = {
  getEmployees(companyId: string) {
    return employeeModel.findAll(companyId)
  },

  getShifts(companyId: string) {
    return shiftModel.findAll(companyId)
  },

  getShiftsByEmployee(employeeId: string, companyId: string) {
    return shiftModel.findByEmployeeId(employeeId, companyId)
  },

  updateShift(input: ShiftUpdateInput, companyId: string) {
    const existing = shiftModel.findById(input.id, companyId)
    if (!existing) {
      throw new AppError('shift not found', 404)
    }

    const { id, ...updateData } = input
    const updated = shiftModel.update(id, companyId, updateData)

    const employee = employeeModel.findById(existing.employeeId, companyId)
    activityModel.create({
      id: generateId(),
      companyId,
      type: 'shift_updated',
      description: `shift updated for ${employee?.name ?? 'unknown'} on ${existing.date}`,
      employeeId: existing.employeeId,
    })

    return updated
  },

  createShift(input: ShiftCreateInput, companyId: string) {
    const employee = employeeModel.findById(input.employeeId, companyId)
    if (!employee) {
      throw new AppError('employee not found', 404)
    }

    const id = generateId()
    const shift = shiftModel.create({ id, companyId, ...input })

    activityModel.create({
      id: generateId(),
      companyId,
      type: 'shift_created',
      description: `shift created for ${employee.name} on ${input.date}`,
      employeeId: input.employeeId,
    })

    return shift
  },
}
