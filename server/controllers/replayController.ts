import type { H3Event } from 'h3'
import { z } from 'zod'
import { replayService } from '../services/replayService'
import { permissionService } from '../services/permissionService'
import { requireAuth, requirePermission } from '../utils/auth'
import { apiError } from '../utils/errors'
import { getParamsWithSchema, readBodyWithSchema } from '../utils/validation'

const replayEventSchema = z.object({}).passthrough()

const startSessionSchema = z.object({
  route: z.string().trim().min(1),
})

const recordEventsSchema = z.object({
  sessionId: z.string().trim().min(1),
  events: z.array(replayEventSchema).min(1).max(100),
})

const endSessionSchema = z.object({
  sessionId: z.string().trim().min(1),
  eventCount: z.number().int().min(0).optional(),
})

const replayIdParamSchema = z.object({
  id: z.string().trim().min(1),
})

export const replayController = {
  getSessions(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewInsights(user), 'view replay sessions')
    const sessions = replayService.getSessions(user.companyId)
    return { sessions }
  },

  getSession(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewInsights(user), 'view replay session')
    const { id } = getParamsWithSchema(event, replayIdParamSchema)

    const data = replayService.getSession(id, user.companyId)
    if (!data) throw apiError('not_found', 'session not found', { id }, event)

    return data
  },

  async startSession(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, startSessionSchema)

    const session = replayService.startSession(user.id, user.name, user.companyId, body.route)
    return { session }
  },

  async recordEvents(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, recordEventsSchema)

    const count = replayService.recordEvents(body.sessionId, user.companyId, body.events)
    return { recorded: count }
  },

  async endSession(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, endSessionSchema)

    const session = replayService.endSession(body.sessionId, user.companyId, body.eventCount ?? 0)
    return { session }
  },
}
