import type { H3Event } from 'h3'
import { z } from 'zod'
import { mfaService } from '../services/mfaService'
import { requireAuth } from '../utils/auth'
import { apiError } from '../utils/errors'
import { readBodyWithSchema } from '../utils/validation'

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
    const body = await readBodyWithSchema(event, codeSchema)
    const result = mfaService.verify(user.id, body.code)
    if (!result.ok) {
      throw apiError('unauthenticated', 'invalid code', undefined, event)
    }
    return result
  },

  async disable(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, codeSchema)
    const result = mfaService.verify(user.id, body.code)
    if (!result.ok && !mfaService.consumeRecoveryCode(user.id, body.code)) {
      throw apiError('unauthenticated', 'invalid code', undefined, event)
    }
    mfaService.disable(user.id)
    return { ok: true }
  },
}
