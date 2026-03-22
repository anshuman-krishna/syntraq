import { eq, desc, and, gte } from 'drizzle-orm'
import { db } from '../db/client'
import { behaviorEvents } from '../db/schema'

export const behaviorModel = {
  create(data: typeof behaviorEvents.$inferInsert) {
    return db.insert(behaviorEvents).values(data).returning().get()
  },

  createBatch(data: (typeof behaviorEvents.$inferInsert)[]) {
    return db.insert(behaviorEvents).values(data).returning().all()
  },

  findByUser(userId: string, companyId: string, limit = 50) {
    return db.select().from(behaviorEvents)
      .where(and(eq(behaviorEvents.userId, userId), eq(behaviorEvents.companyId, companyId)))
      .orderBy(desc(behaviorEvents.createdAt))
      .limit(limit)
      .all()
  },

  findRecentByUserAndRoute(userId: string, companyId: string, route: string, since: Date) {
    return db.select().from(behaviorEvents)
      .where(
        and(
          eq(behaviorEvents.userId, userId),
          eq(behaviorEvents.companyId, companyId),
          eq(behaviorEvents.route, route),
          gte(behaviorEvents.createdAt, since),
        ),
      )
      .orderBy(desc(behaviorEvents.createdAt))
      .all()
  },

  countByUserAndRoute(userId: string, companyId: string, route: string) {
    return db.select().from(behaviorEvents)
      .where(
        and(
          eq(behaviorEvents.userId, userId),
          eq(behaviorEvents.companyId, companyId),
          eq(behaviorEvents.route, route),
        ),
      )
      .all()
      .length
  },
}
