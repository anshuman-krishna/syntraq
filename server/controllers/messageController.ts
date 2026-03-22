import type { H3Event } from 'h3'
import { messageService } from '../services/messageService'
import { realtimeService } from '../services/realtimeService'
import { requireAuth } from '../utils/auth'

export const messageController = {
  getMessages(event: H3Event) {
    const user = requireAuth(event)
    const query = getQuery(event)
    const channelId = typeof query.channel === 'string' ? query.channel : 'general'
    const messages = messageService.getMessages(channelId, user.companyId)
    return { messages }
  },

  async sendMessage(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    if (!content || content.length > 2000) {
      throw createError({ statusCode: 400, message: 'message must be 1-2000 characters' })
    }

    const channelId = typeof body?.channelId === 'string' ? body.channelId : 'general'
    const replyTo = typeof body?.replyTo === 'string' ? body.replyTo : undefined

    const message = messageService.sendMessage({
      channelId,
      userId: user.id,
      userName: user.name,
      content,
      companyId: user.companyId,
      replyTo,
    })

    realtimeService.broadcast({
      type: 'message_created',
      payload: { message },
      userId: user.id,
      userName: user.name,
      companyId: user.companyId,
      timestamp: new Date().toISOString(),
    })

    return { message }
  },
}
