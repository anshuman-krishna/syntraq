import type { H3Event } from 'h3'
import { lucia } from '../db/auth'
import { authService, AppError } from '../services/authService'
import { loginSchema, registerSchema } from '../../shared/utils/validation'

export const authController = {
  async register(event: H3Event) {
    const body = await readBody(event)
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.issues[0].message })
    }

    try {
      const user = await authService.register(parsed.data)
      const session = await lucia.createSession(user.id, {})
      appendResponseHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())
      return { user }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async login(event: H3Event) {
    const body = await readBody(event)
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.issues[0].message })
    }

    try {
      const user = await authService.login(parsed.data)
      const session = await lucia.createSession(user.id, {})
      appendResponseHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())
      return { user }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
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
    const user = event.context.user
    if (!user) {
      throw createError({ statusCode: 401, message: 'not authenticated' })
    }
    return { user }
  },
}
