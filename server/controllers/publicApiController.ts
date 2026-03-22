import type { H3Event } from 'h3'
import { requireApiKey, requireApiPermission } from '../utils/apiAuth'
import { employeeModel } from '../models/employeeModel'
import { shiftModel } from '../models/shiftModel'
import { vehicleModel } from '../models/vehicleModel'
import { workflowModel } from '../models/workflowModel'
import { apiUsageModel } from '../models/apiUsageModel'
import { generateId } from '../../shared/utils/id'

function logUsage(event: H3Event, keyId: string, companyId: string, statusCode: number) {
  const start = event.context._apiStart as number | undefined
  const responseTime = start ? Date.now() - start : undefined
  apiUsageModel.create({
    id: generateId(),
    apiKeyId: keyId,
    companyId,
    method: getMethod(event),
    path: getRequestURL(event).pathname,
    statusCode,
    responseTime,
  })
}

export const publicApiController = {
  // employees
  listEmployees(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'employees')

    const employees = employeeModel.findAll(ctx.companyId)
    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: employees, total: employees.length }
  },

  getEmployee(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'employees')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'id is required' })

    const employee = employeeModel.findById(id, ctx.companyId)
    if (!employee) {
      logUsage(event, ctx.keyId, ctx.companyId, 404)
      throw createError({ statusCode: 404, message: 'employee not found' })
    }

    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: employee }
  },

  // shifts
  listShifts(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'shifts')

    const query = getQuery(event)
    const date = typeof query.date === 'string' ? query.date : null
    const status = typeof query.status === 'string' ? query.status : null
    const validStatuses = ['scheduled', 'active', 'completed', 'cancelled'] as const

    let shifts
    if (date) {
      shifts = shiftModel.findByDate(date, ctx.companyId)
    } else if (status && validStatuses.includes(status as typeof validStatuses[number])) {
      shifts = shiftModel.findByStatus(status as typeof validStatuses[number], ctx.companyId)
    } else {
      shifts = shiftModel.findAll(ctx.companyId)
    }

    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: shifts, total: shifts.length }
  },

  getShift(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'shifts')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'id is required' })

    const shift = shiftModel.findById(id, ctx.companyId)
    if (!shift) {
      logUsage(event, ctx.keyId, ctx.companyId, 404)
      throw createError({ statusCode: 404, message: 'shift not found' })
    }

    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: shift }
  },

  // vehicles
  listVehicles(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'vehicles')

    const vehicles = vehicleModel.findAll(ctx.companyId)
    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: vehicles, total: vehicles.length }
  },

  getVehicle(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'vehicles')

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'id is required' })

    const vehicle = vehicleModel.findById(id, ctx.companyId)
    if (!vehicle) {
      logUsage(event, ctx.keyId, ctx.companyId, 404)
      throw createError({ statusCode: 404, message: 'vehicle not found' })
    }

    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: vehicle }
  },

  // workflows
  listWorkflows(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'workflows')

    const workflows = workflowModel.findAll(ctx.companyId)
    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: workflows, total: workflows.length }
  },
}
