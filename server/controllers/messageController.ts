import type { H3Event } from 'h3'
import { z } from 'zod'
import { messageService } from '../services/messageService'
import { realtimeService } from '../services/realtimeService'
import { requireAuth } from '../utils/auth'
import { getQueryWithSchema, readBodyWithSchema } from '../utils/validation'

const messagesQuerySchema = z.object({
  channel: z.string().trim().min(1).optional(),
})

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  channelId: z.string().trim().min(1).optional(),
  replyTo: z.string().trim().min(1).optional(),
})

export const messageController = {
  getMessages(event: H3Event) {
    const user = requireAuth(event)
    const query = getQueryWithSchema(event, messagesQuerySchema)
    const channelId = query.channel ?? 'general'
    const messages = messageService.getMessages(channelId, user.companyId)
    return { messages }
  },

  async sendMessage(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, sendMessageSchema)

    const message = messageService.sendMessage({
      channelId: body.channelId ?? 'general',
      userId: user.id,
      userName: user.name,
      content: body.content,
      companyId: user.companyId,
      replyTo: body.replyTo,
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
