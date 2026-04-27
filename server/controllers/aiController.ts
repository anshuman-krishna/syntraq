import type { H3Event } from 'h3'
import { z } from 'zod'
import { aiService } from '../services/aiService'
import { apiError } from '../utils/errors'
import { requireAuth } from '../utils/auth'
import { readBodyWithSchema } from '../utils/validation'

const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
  context: z.object({
    route: z.string().trim().min(1).optional(),
    module: z.string().trim().min(1).optional(),
  }).optional(),
})

export const aiController = {
  async chat(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, chatSchema)
    const context = {
      route: body.context?.route ?? '/',
      module: body.context?.module,
      companyId: user.companyId,
    }

    const response = aiService.processMessage(body.message, context)
    if (!response) {
      throw apiError('internal_error', 'ai response unavailable', undefined, event)
    }
    return { message: response }
  },
}
