import { lucia } from '../db/auth'
import type { User, Session } from 'lucia'

declare module 'h3' {
  interface H3EventContext {
    user: (User & { companyId: string }) | null
    session: Session | null
  }
}

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, lucia.sessionCookieName)

  if (!sessionId) {
    event.context.user = null
    event.context.session = null
    return
  }

  const { session, user } = await lucia.validateSession(sessionId)

  if (session?.fresh) {
    appendResponseHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())
  }

  if (!session) {
    appendResponseHeader(event, 'Set-Cookie', lucia.createBlankSessionCookie().serialize())
  }

  event.context.user = user as (User & { companyId: string }) | null
  event.context.session = session
})
