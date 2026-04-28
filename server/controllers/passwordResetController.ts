import type { H3Event } from 'h3'
import { z } from 'zod'
import { lucia } from '../db/auth'
import { passwordResetService } from '../services/passwordResetService'
import { auditService } from '../services/auditService'
import { userModel } from '../models/userModel'
import { readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const requestSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
})

const confirmSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(128),
})

export const passwordResetController = {
  async request(event: H3Event) {
    const body = await readBodyWithSchema(event, requestSchema)
    await passwordResetService.request(body.email)
    return { ok: true }
  },

  async confirm(event: H3Event) {
    const body = await readBodyWithSchema(event, confirmSchema)

    try {
      const { userId } = await passwordResetService.confirm(body.token, body.password)

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
      rethrowAsApiError(e, event)
    }
  },
}
