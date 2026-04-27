import type { H3Event } from 'h3'
import { z } from 'zod'
import { behaviorService } from '../services/behaviorService'
import { requireAuth } from '../utils/auth'
import { getQueryWithSchema, readBodyWithSchema } from '../utils/validation'

const behaviorEventSchema = z.object({
  type: z.enum(['page_visit', 'action', 'hesitation']),
  route: z.string().trim().min(1),
  action: z.string().trim().optional(),
  metadata: z.string().optional(),
}).passthrough()

const trackBehaviorSchema = z.object({
  events: z.array(behaviorEventSchema).min(1).max(50),
})

const tutorialSuggestionQuerySchema = z.object({
  route: z.string().trim().min(1),
})

export const behaviorController = {
  async track(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, trackBehaviorSchema)

    behaviorService.trackBatch(user.id, user.companyId, body.events)
    return { tracked: body.events.length }
  },

  suggestTutorial(event: H3Event) {
    const user = requireAuth(event)
    const query = getQueryWithSchema(event, tutorialSuggestionQuerySchema)

    const suggest = behaviorService.shouldSuggestTutorial(user.id, user.companyId, query.route)
    return { suggest }
  },
}
