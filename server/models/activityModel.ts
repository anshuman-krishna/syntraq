import { desc } from 'drizzle-orm'
import { db } from '../db/client'
import { activities } from '../db/schema'

export const activityModel = {
  findRecent(limit = 10) {
    return db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit).all()
  },

  create(data: typeof activities.$inferInsert) {
    return db.insert(activities).values(data).returning().get()
  },
}
