import type { H3Event } from 'h3'
import { z } from 'zod'
import { sessionService } from '../services/sessionService'
import { accountLinkService } from '../services/accountLinkService'
import { requireAuth } from '../utils/auth'
import { apiError } from '../utils/errors'

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
    const parsed = revokeSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }
    const sessionId = event.context.session?.id ?? null
    return await sessionService.revoke(parsed.data.id, user.id, sessionId)
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
    const parsed = revokeSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }
    accountLinkService.unlink(parsed.data.id, user.id)
    return { ok: true }
  },
}
