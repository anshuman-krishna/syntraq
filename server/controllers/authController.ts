import type { H3Event } from 'h3'
import { lucia } from '../db/auth'
import { authService } from '../services/authService'
import { auditService } from '../services/auditService'
import { emailService } from '../services/emailService'
import { companyModel } from '../models/companyModel'
import { loginSchema, registerSchema } from '../../shared/utils/validation'
import { requireAuth } from '../utils/auth'
import { readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

export const authController = {
  async register(event: H3Event) {
    const body = await readBodyWithSchema(event, registerSchema)

    try {
      const user = await authService.register(body)
      const session = await lucia.createSession(user.id, {})
      appendResponseHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'auth.register',
        entityType: 'user',
        entityId: user.id,
      })

      emailService.sendWelcome(user.email, user.name, user.companyName).catch(() => {})

      return { user }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async login(event: H3Event) {
    const body = await readBodyWithSchema(event, loginSchema)

    try {
      const user = await authService.login(body)
      const session = await lucia.createSession(user.id, {})
      appendResponseHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'auth.login',
        entityType: 'session',
      })

      return { user }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async logout(event: H3Event) {
    const session = event.context.session
    if (session) {
      await lucia.invalidateSession(session.id)
    }
    appendResponseHeader(event, 'Set-Cookie', lucia.createBlankSessionCookie().serialize())
    return { success: true }
  },

  async me(event: H3Event) {
    const user = requireAuth(event)
    const company = companyModel.findById(user.companyId)

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        companyName: company?.name ?? '',
      },
    }
  },
}
