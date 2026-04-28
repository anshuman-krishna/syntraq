import type { H3Event } from 'h3'
import { z } from 'zod'
import { requireApiKey, requireApiPermission } from '../utils/apiAuth'
import { employeeModel } from '../models/employeeModel'
import { shiftModel } from '../models/shiftModel'
import { vehicleModel } from '../models/vehicleModel'
import { workflowModel } from '../models/workflowModel'
import { apiUsageModel } from '../models/apiUsageModel'
import { generateId } from '../../shared/utils/id'
import { apiError } from '../utils/errors'
import { getParamsWithSchema, getQueryWithSchema } from '../utils/validation'

const idParamSchema = z.object({
  id: z.string().trim().min(1),
})

const shiftsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
})

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

    const { id } = getParamsWithSchema(event, idParamSchema)

    const employee = employeeModel.findById(id, ctx.companyId)
    if (!employee) {
      logUsage(event, ctx.keyId, ctx.companyId, 404)
      throw apiError('not_found', 'employee not found', { id }, event)
    }

    logUsage(event, ctx.keyId, ctx.companyId, 200)
    return { data: employee }
  },

  // shifts
  listShifts(event: H3Event) {
    event.context._apiStart = Date.now()
    const ctx = requireApiKey(event)
    requireApiPermission(ctx, 'shifts')

    const query = getQueryWithSchema(event, shiftsQuerySchema)
    const date = query.date ?? null
    const status = query.status ?? null

    let shifts
    if (date) {
      shifts = shiftModel.findByDate(date, ctx.companyId)
    } else if (status) {
      shifts = shiftModel.findByStatus(status, ctx.companyId)
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

    const { id } = getParamsWithSchema(event, idParamSchema)

    const shift = shiftModel.findById(id, ctx.companyId)
    if (!shift) {
      logUsage(event, ctx.keyId, ctx.companyId, 404)
      throw apiError('not_found', 'shift not found', { id }, event)
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

    const { id } = getParamsWithSchema(event, idParamSchema)

    const vehicle = vehicleModel.findById(id, ctx.companyId)
    if (!vehicle) {
      logUsage(event, ctx.keyId, ctx.companyId, 404)
      throw apiError('not_found', 'vehicle not found', { id }, event)
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
