import type { H3Event } from 'h3'
import { rosterService } from '../services/rosterService'
import { AppError } from '../services/authService'
import { shiftUpdateSchema, shiftCreateSchema } from '../../shared/utils/validation'

function requireAuth(event: H3Event) {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: 'not authenticated' })
  }
}

export const rosterController = {
  getEmployees(event: H3Event) {
    requireAuth(event)
    const employees = rosterService.getEmployees()
    return { employees }
  },

  getShifts(event: H3Event) {
    requireAuth(event)
    const shifts = rosterService.getShifts()
    return { shifts }
  },

  getRoster(event: H3Event) {
    requireAuth(event)
    const employees = rosterService.getEmployees()
    const shifts = rosterService.getShifts()
    return { employees, shifts }
  },

  async updateShift(event: H3Event) {
    requireAuth(event)
    const body = await readBody(event)
    const parsed = shiftUpdateSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.issues[0].message })
    }

    try {
      const shift = rosterService.updateShift(parsed.data)
      return { shift }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async createShift(event: H3Event) {
    requireAuth(event)
    const body = await readBody(event)
    const parsed = shiftCreateSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.issues[0].message })
    }

    try {
      const shift = rosterService.createShift(parsed.data)
      return { shift }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },
}
