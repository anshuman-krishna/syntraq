import { lucia } from '../db/auth'

export const sessionService = {
  async list(userId: string, currentSessionId: string | null) {
    const sessions = await lucia.getUserSessions(userId)
    return sessions.map(s => ({
      id: s.id,
      current: s.id === currentSessionId,
      expiresAt: s.expiresAt,
      fresh: s.fresh,
    }))
  },

  async revoke(sessionId: string, userId: string, currentSessionId: string | null) {
    // verify the target session belongs to the caller before revoking
    const sessions = await lucia.getUserSessions(userId)
    const target = sessions.find(s => s.id === sessionId)
    if (!target) return { revoked: false }

    await lucia.invalidateSession(sessionId)
    return { revoked: true, wasCurrent: sessionId === currentSessionId }
  },

  async revokeAllExceptCurrent(userId: string, currentSessionId: string) {
    const sessions = await lucia.getUserSessions(userId)
    await Promise.all(
      sessions
        .filter(s => s.id !== currentSessionId)
        .map(s => lucia.invalidateSession(s.id)),
    )
    return { revoked: sessions.length - 1 }
  },
}
