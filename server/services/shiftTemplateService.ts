import { generateId } from '../../shared/utils/id'
import { shiftTemplateModel } from '../models/shiftTemplateModel'
import { employeeModel } from '../models/employeeModel'
import { vehicleModel } from '../models/vehicleModel'
import { shiftModel } from '../models/shiftModel'
import { activityModel } from '../models/activityModel'
import { AppError } from './authService'

interface TemplateInput {
  name: string
  employeeId: string
  vehicleId?: string | null
  startTime: string
  endTime: string
  weekdays: number[]
}

// resolve the concrete dates in the week starting at weekStart that fall on the
// template's weekdays (0 = sunday). all math in utc to stay timezone-stable.
function datesForWeek(weekStart: string, weekdays: number[]): string[] {
  const start = new Date(`${weekStart}T00:00:00Z`)
  const wanted = new Set(weekdays)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + i)
    if (wanted.has(day.getUTCDay())) dates.push(day.toISOString().slice(0, 10))
  }
  return dates
}

export const shiftTemplateService = {
  // templates plus the lists the create form needs, all company-scoped
  getOverview(companyId: string) {
    const templates = shiftTemplateModel.findByCompany(companyId).map(t => ({
      ...t,
      weekdays: JSON.parse(t.weekdays) as number[],
    }))

    return {
      templates,
      employees: employeeModel.findAll(companyId),
      vehicles: vehicleModel.findAll(companyId),
    }
  },

  createTemplate(input: TemplateInput, companyId: string, userId: string) {
    const employee = employeeModel.findById(input.employeeId, companyId)
    if (!employee) {
      throw new AppError('employee not found', 404)
    }

    const template = shiftTemplateModel.create({
      id: generateId(),
      companyId,
      name: input.name,
      employeeId: input.employeeId,
      vehicleId: input.vehicleId ?? null,
      startTime: input.startTime,
      endTime: input.endTime,
      weekdays: JSON.stringify(input.weekdays),
      createdBy: userId,
    })

    return { ...template, weekdays: input.weekdays }
  },

  applyTemplate(id: string, weekStart: string, companyId: string) {
    const template = shiftTemplateModel.findById(id, companyId)
    if (!template) {
      throw new AppError('template not found', 404)
    }

    const weekdays = JSON.parse(template.weekdays) as number[]
    const dates = datesForWeek(weekStart, weekdays)

    const shifts = dates.map(date => shiftModel.create({
      id: generateId(),
      companyId,
      employeeId: template.employeeId,
      date,
      startTime: template.startTime,
      endTime: template.endTime,
      status: 'scheduled',
      vehicleId: template.vehicleId,
      notes: `from template: ${template.name}`,
    }))

    if (shifts.length > 0) {
      activityModel.create({
        id: generateId(),
        companyId,
        type: 'shift_created',
        description: `${shifts.length} shifts created from template ${template.name}`,
        employeeId: template.employeeId,
      })
    }

    return shifts
  },

  removeTemplate(id: string, companyId: string) {
    const template = shiftTemplateModel.findById(id, companyId)
    if (!template) {
      throw new AppError('template not found', 404)
    }

    shiftTemplateModel.remove(id, companyId)
    return { id }
  },
}
