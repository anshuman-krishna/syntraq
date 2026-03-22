import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { replaySessions, replayEvents } from '../db/schema'

export const replayModel = {
  createSession(data: typeof replaySessions.$inferInsert) {
    return db.insert(replaySessions).values(data).returning().get()
  },

  endSession(id: string, companyId: string, eventCount: number) {
    return db.update(replaySessions)
      .set({ endedAt: new Date(), eventCount })
      .where(and(eq(replaySessions.id, id), eq(replaySessions.companyId, companyId)))
      .returning()
      .get()
  },

  findSessions(companyId: string, limit = 50) {
    return db.select()
      .from(replaySessions)
      .where(eq(replaySessions.companyId, companyId))
      .orderBy(desc(replaySessions.startedAt))
      .limit(limit)
      .all()
  },

  findSessionById(id: string, companyId: string) {
    return db.select()
      .from(replaySessions)
      .where(and(eq(replaySessions.id, id), eq(replaySessions.companyId, companyId)))
      .get()
  },

  createEvents(events: (typeof replayEvents.$inferInsert)[]) {
    if (events.length === 0) return
    db.insert(replayEvents).values(events).run()
  },

  findEventsBySession(sessionId: string, companyId: string) {
    return db.select()
      .from(replayEvents)
      .where(and(eq(replayEvents.sessionId, sessionId), eq(replayEvents.companyId, companyId)))
      .orderBy(replayEvents.timestamp)
      .all()
  },
}
