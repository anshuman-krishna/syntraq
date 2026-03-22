import type { H3Event } from 'h3'
import { commentService } from '../services/commentService'
import { realtimeService } from '../services/realtimeService'
import { requireAuth } from '../utils/auth'

export const commentController = {
  getComments(event: H3Event) {
    const user = requireAuth(event)
    const query = getQuery(event)
    const entityType = typeof query.entityType === 'string' ? query.entityType : ''
    const entityId = typeof query.entityId === 'string' ? query.entityId : ''

    if (!entityType || !entityId) {
      throw createError({ statusCode: 400, message: 'entityType and entityId required' })
    }

    const comments = commentService.getComments(entityType, entityId, user.companyId)
    return { comments }
  },

  async addComment(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)

    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    if (!content || content.length > 1000) {
      throw createError({ statusCode: 400, message: 'comment must be 1-1000 characters' })
    }

    const entityType = typeof body?.entityType === 'string' ? body.entityType : ''
    const entityId = typeof body?.entityId === 'string' ? body.entityId : ''
    if (!entityType || !entityId) {
      throw createError({ statusCode: 400, message: 'entityType and entityId required' })
    }

    const comment = commentService.addComment({
      entityType,
      entityId,
      userId: user.id,
      userName: user.name,
      content,
      companyId: user.companyId,
    })

    realtimeService.broadcast({
      type: 'comment_created',
      payload: { comment },
      userId: user.id,
      userName: user.name,
      companyId: user.companyId,
      timestamp: new Date().toISOString(),
    })

    return { comment }
  },

  async resolveComment(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''
    if (!id) throw createError({ statusCode: 400, message: 'comment id required' })

    const comment = commentService.resolveComment(id, user.companyId)
    return { comment }
  },
}
