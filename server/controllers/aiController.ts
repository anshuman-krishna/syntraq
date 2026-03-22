import type { H3Event } from 'h3'
import { aiService } from '../services/aiService'
import { requireAuth } from '../utils/auth'

export const aiController = {
  async chat(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    if (!message || message.length > 500) {
      throw createError({ statusCode: 400, message: 'message must be 1-500 characters' })
    }
    const context = {
      route: typeof body?.context?.route === 'string' ? body.context.route : '/',
      module: typeof body?.context?.module === 'string' ? body.context.module : undefined,
      companyId: user.companyId,
    }

    const response = aiService.processMessage(message, context)
    return { message: response }
  },
}
