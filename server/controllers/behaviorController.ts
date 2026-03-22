import type { H3Event } from 'h3'
import { behaviorService } from '../services/behaviorService'
import { requireAuth } from '../utils/auth'

export const behaviorController = {
  async track(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    if (!Array.isArray(body?.events) || body.events.length === 0 || body.events.length > 50) {
      throw createError({ statusCode: 400, message: 'events must be an array of 1-50 items' })
    }

    const validTypes = ['page_visit', 'action', 'hesitation'] as const
    const events = body.events.filter((e: Record<string, unknown>) =>
      typeof e?.type === 'string'
      && validTypes.includes(e.type as typeof validTypes[number])
      && typeof e?.route === 'string',
    )

    if (events.length === 0) {
      throw createError({ statusCode: 400, message: 'no valid events' })
    }

    behaviorService.trackBatch(user.id, user.companyId, events)
    return { tracked: events.length }
  },

  suggestTutorial(event: H3Event) {
    const user = requireAuth(event)
    const route = getQuery(event).route as string | undefined
    if (!route) {
      throw createError({ statusCode: 400, message: 'route query param required' })
    }

    const suggest = behaviorService.shouldSuggestTutorial(user.id, user.companyId, route)
    return { suggest }
  },
}
