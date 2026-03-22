import type { H3Event } from 'h3'
import { replayService } from '../services/replayService'
import { permissionService } from '../services/permissionService'
import { requireAuth, requirePermission } from '../utils/auth'

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
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'id required' })

    const data = replayService.getSession(id, user.companyId)
    if (!data) throw createError({ statusCode: 404, message: 'session not found' })

    return data
  },

  async startSession(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    if (typeof body?.route !== 'string') {
      throw createError({ statusCode: 400, message: 'route is required' })
    }

    const session = replayService.startSession(user.id, user.name, user.companyId, body.route)
    return { session }
  },

  async recordEvents(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    if (typeof body?.sessionId !== 'string') {
      throw createError({ statusCode: 400, message: 'sessionId is required' })
    }

    if (!Array.isArray(body?.events) || body.events.length === 0 || body.events.length > 100) {
      throw createError({ statusCode: 400, message: 'events must be an array of 1-100 items' })
    }

    const count = replayService.recordEvents(body.sessionId, user.companyId, body.events)
    return { recorded: count }
  },

  async endSession(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    if (typeof body?.sessionId !== 'string') {
      throw createError({ statusCode: 400, message: 'sessionId is required' })
    }

    const session = replayService.endSession(body.sessionId, user.companyId, body.eventCount ?? 0)
    return { session }
  },
}
