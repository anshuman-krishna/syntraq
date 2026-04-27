import type { H3Event } from 'h3'
import { z } from 'zod'
import { commentService } from '../services/commentService'
import { realtimeService } from '../services/realtimeService'
import { requireAuth } from '../utils/auth'
import { getQueryWithSchema, readBodyWithSchema } from '../utils/validation'

const commentsQuerySchema = z.object({
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1),
})

const addCommentSchema = z.object({
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1),
  content: z.string().trim().min(1).max(1000),
})

const resolveCommentSchema = z.object({
  id: z.string().trim().min(1),
})

export const commentController = {
  getComments(event: H3Event) {
    const user = requireAuth(event)
    const query = getQueryWithSchema(event, commentsQuerySchema)

    const comments = commentService.getComments(query.entityType, query.entityId, user.companyId)
    return { comments }
  },

  async addComment(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, addCommentSchema)

    const comment = commentService.addComment({
      entityType: body.entityType,
      entityId: body.entityId,
      userId: user.id,
      userName: user.name,
      content: body.content,
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
    const body = await readBodyWithSchema(event, resolveCommentSchema)

    const comment = commentService.resolveComment(body.id, user.companyId)
    return { comment }
  },
}
