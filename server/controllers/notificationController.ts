import type { H3Event } from 'h3'
import { z } from 'zod'
import { notificationService } from '../services/notificationService'
import { requireAuth } from '../utils/auth'
import { readBodyWithSchema } from '../utils/validation'

const markReadSchema = z.object({
  id: z.string().trim().min(1),
})

export const notificationController = {
  getAll(event: H3Event) {
    const user = requireAuth(event)
    const notifications = notificationService.getUserNotifications(user.id, user.companyId)
    const unreadCount = notificationService.getUnreadCount(user.id, user.companyId)
    return { notifications, unreadCount }
  },

  async markRead(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, markReadSchema)

    notificationService.markRead(body.id, user.id)
    return { ok: true }
  },

  markAllRead(event: H3Event) {
    const user = requireAuth(event)
    notificationService.markAllRead(user.id, user.companyId)
    return { ok: true }
  },
}
