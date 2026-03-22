import { generateId } from '../../shared/utils/id'
import { commentModel } from '../models/commentModel'

export const commentService = {
  getComments(entityType: string, entityId: string, companyId: string) {
    return commentModel.findByEntity(entityType, entityId, companyId)
  },

  addComment(data: {
    entityType: string
    entityId: string
    userId: string
    userName: string
    content: string
    companyId: string
  }) {
    return commentModel.create({
      id: generateId(),
      companyId: data.companyId,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      userName: data.userName,
      content: data.content,
    })
  },

  resolveComment(id: string, companyId: string) {
    return commentModel.resolve(id, companyId)
  },

  getRecent(companyId: string, limit = 50) {
    return commentModel.findAll(companyId, limit)
  },
}
