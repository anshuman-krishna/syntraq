import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { savedViews } from '../db/schema'

export const savedViewModel = {
  findByUser(userId: string, companyId: string) {
    return db.select().from(savedViews)
      .where(and(eq(savedViews.userId, userId), eq(savedViews.companyId, companyId)))
      .orderBy(desc(savedViews.createdAt))
      .all()
  },

  findById(id: string, userId: string, companyId: string) {
    return db.select().from(savedViews)
      .where(and(eq(savedViews.id, id), eq(savedViews.userId, userId), eq(savedViews.companyId, companyId)))
      .get()
  },

  create(data: typeof savedViews.$inferInsert) {
    return db.insert(savedViews).values(data).returning().get()
  },

  remove(id: string, userId: string, companyId: string) {
    return db.delete(savedViews)
      .where(and(eq(savedViews.id, id), eq(savedViews.userId, userId), eq(savedViews.companyId, companyId)))
      .run()
  },
}
