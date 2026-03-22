import { eq, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { activities } from '../db/schema'

export const activityModel = {
  findRecent(companyId: string, limit = 10) {
    return db.select().from(activities)
      .where(eq(activities.companyId, companyId))
      .orderBy(desc(activities.createdAt))
      .limit(limit)
      .all()
  },

  create(data: typeof activities.$inferInsert) {
    return db.insert(activities).values(data).returning().get()
  },
}
