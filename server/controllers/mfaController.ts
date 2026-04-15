import type { H3Event } from 'h3'
import { z } from 'zod'
import { mfaService } from '../services/mfaService'
import { requireAuth } from '../utils/auth'
import { apiError } from '../utils/errors'

const codeSchema = z.object({ code: z.string().min(6).max(12) })

export const mfaController = {
  async status(event: H3Event) {
    const user = requireAuth(event)
    return mfaService.status(user.id)
  },

  async enroll(event: H3Event) {
    const user = requireAuth(event)
    const existing = mfaService.status(user.id)
    if (existing.verified) {
      throw apiError('conflict', 'mfa already enrolled', undefined, event)
    }
    return mfaService.beginEnroll(user.id, user.email)
  },

  async verify(event: H3Event) {
    const user = requireAuth(event)
    const parsed = codeSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }
    const result = mfaService.verify(user.id, parsed.data.code)
    if (!result.ok) {
      throw apiError('unauthenticated', 'invalid code', undefined, event)
    }
    return result
  },

  async disable(event: H3Event) {
    const user = requireAuth(event)
    const parsed = codeSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }
    const result = mfaService.verify(user.id, parsed.data.code)
    if (!result.ok && !mfaService.consumeRecoveryCode(user.id, parsed.data.code)) {
      throw apiError('unauthenticated', 'invalid code', undefined, event)
    }
    mfaService.disable(user.id)
    return { ok: true }
  },
}
