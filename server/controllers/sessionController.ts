import type { H3Event } from 'h3'
import { z } from 'zod'
import { sessionService } from '../services/sessionService'
import { accountLinkService } from '../services/accountLinkService'
import { requireAuth } from '../utils/auth'
import { apiError } from '../utils/errors'
import { readBodyWithSchema } from '../utils/validation'

const revokeSchema = z.object({
  id: z.string().min(1),
})

export const sessionController = {
  async list(event: H3Event) {
    const user = requireAuth(event)
    const sessionId = event.context.session?.id ?? null
    const sessions = await sessionService.list(user.id, sessionId)
    return { sessions }
  },

  async revoke(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, revokeSchema)
    const sessionId = event.context.session?.id ?? null
    return await sessionService.revoke(body.id, user.id, sessionId)
  },

  async revokeOthers(event: H3Event) {
    const user = requireAuth(event)
    const sessionId = event.context.session?.id
    if (!sessionId) {
      throw apiError('unauthenticated', 'no active session', undefined, event)
    }
    return await sessionService.revokeAllExceptCurrent(user.id, sessionId)
  },

  async listOauth(event: H3Event) {
    const user = requireAuth(event)
    return { accounts: accountLinkService.list(user.id) }
  },

  async unlinkOauth(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, revokeSchema)
    accountLinkService.unlink(body.id, user.id)
    return { ok: true }
  },
}
