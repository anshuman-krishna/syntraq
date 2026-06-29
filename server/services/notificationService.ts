import { generateId } from '../../shared/utils/id'
import { notificationModel } from '../models/notificationModel'
import { notificationPreferenceService } from './notificationPreferenceService'

export const notificationService = {
  create(userId: string, companyId: string, type: string, title: string, message: string, metadata?: string) {
    // respect per-user opt-outs; an unknown type is always delivered
    if (!notificationPreferenceService.isEnabled(userId, type)) {
      return null
    }

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
