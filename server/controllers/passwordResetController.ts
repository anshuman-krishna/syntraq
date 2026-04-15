import type { H3Event } from 'h3'
import { z } from 'zod'
import { lucia } from '../db/auth'
import { passwordResetService } from '../services/passwordResetService'
import { auditService } from '../services/auditService'
import { userModel } from '../models/userModel'
import { AppError } from '../services/authService'
import { apiError } from '../utils/errors'

const requestSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
})

const confirmSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(128),
})

export const passwordResetController = {
  async request(event: H3Event) {
    const parsed = requestSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }
    await passwordResetService.request(parsed.data.email)
    return { ok: true }
  },

  async confirm(event: H3Event) {
    const parsed = confirmSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }

    try {
      const { userId } = await passwordResetService.confirm(parsed.data.token, parsed.data.password)

      // revoke every session for this user — force reauth after reset
      await lucia.invalidateUserSessions(userId)

      const user = userModel.findById(userId)
      if (user) {
        auditService.log({
          companyId: user.companyId,
          userId,
          action: 'auth.password_reset',
          entityType: 'user',
          entityId: userId,
        })
      }

      return { ok: true }
    } catch (e) {
      if (e instanceof AppError) {
        throw apiError('validation_error', e.message, undefined, event)
      }
      throw e
    }
  },
}
