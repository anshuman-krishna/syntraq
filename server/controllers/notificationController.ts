import type { H3Event } from 'h3'
import { notificationService } from '../services/notificationService'
import { requireAuth } from '../utils/auth'

export const notificationController = {
  getAll(event: H3Event) {
    const user = requireAuth(event)
    const notifications = notificationService.getUserNotifications(user.id, user.companyId)
    const unreadCount = notificationService.getUnreadCount(user.id, user.companyId)
    return { notifications, unreadCount }
  },

  async markRead(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    if (typeof body?.id !== 'string') {
      throw createError({ statusCode: 400, message: 'id is required' })
    }

    notificationService.markRead(body.id, user.id)
    return { ok: true }
  },

  markAllRead(event: H3Event) {
    const user = requireAuth(event)
    notificationService.markAllRead(user.id, user.companyId)
    return { ok: true }
  },
}
