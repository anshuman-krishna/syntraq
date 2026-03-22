import { generateId } from '../../shared/utils/id'
import { replayModel } from '../models/replayModel'

export const replayService = {
  startSession(userId: string, userName: string, companyId: string, route: string) {
    return replayModel.createSession({
      id: generateId(),
      companyId,
      userId,
      userName,
      route,
    })
  },

  endSession(sessionId: string, companyId: string, eventCount: number) {
    return replayModel.endSession(sessionId, companyId, eventCount)
  },

  recordEvents(sessionId: string, companyId: string, events: { type: string; route: string; action?: string; metadata?: string }[]) {
    const mapped = events.map(e => ({
      id: generateId(),
      sessionId,
      companyId,
      type: e.type,
      route: e.route,
      action: e.action ?? null,
      metadata: e.metadata ?? null,
    }))
    replayModel.createEvents(mapped)
    return mapped.length
  },

  getSessions(companyId: string, limit = 50) {
    return replayModel.findSessions(companyId, limit)
  },

  getSession(sessionId: string, companyId: string) {
    const session = replayModel.findSessionById(sessionId, companyId)
    if (!session) return null

    const events = replayModel.findEventsBySession(sessionId, companyId)
    return { session, events }
  },
}
