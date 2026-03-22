import { generateId } from '../../shared/utils/id'
import { messageModel } from '../models/messageModel'

export const messageService = {
  getMessages(channelId: string, companyId: string, limit = 50) {
    return messageModel.findByChannel(channelId, companyId, limit)
  },

  sendMessage(data: {
    channelId: string
    userId: string
    userName: string
    content: string
    companyId: string
    replyTo?: string
  }) {
    return messageModel.create({
      id: generateId(),
      companyId: data.companyId,
      channelId: data.channelId,
      userId: data.userId,
      userName: data.userName,
      content: data.content,
      replyTo: data.replyTo ?? null,
    })
  },
}
