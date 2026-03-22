import { generateId } from '../../shared/utils/id'
import { notificationModel } from '../models/notificationModel'

export const notificationService = {
  create(userId: string, companyId: string, type: string, title: string, message: string, metadata?: string) {
    return notificationModel.create({
      id: generateId(),
      userId,
      companyId,
      type,
      title,
      message,
      metadata: metadata ?? null,
    })
  },

  getUserNotifications(userId: string, companyId: string) {
    return notificationModel.findByUser(userId, companyId)
  },

  getUnreadCount(userId: string, companyId: string) {
    return notificationModel.countUnread(userId, companyId)
  },

  markRead(id: string, userId: string) {
    return notificationModel.markRead(id, userId)
  },

  markAllRead(userId: string, companyId: string) {
    notificationModel.markAllRead(userId, companyId)
  },
}
