import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { comments } from '../db/schema'

export const commentModel = {
  findByEntity(entityType: string, entityId: string, companyId: string) {
    return db.select().from(comments)
      .where(and(
        eq(comments.entityType, entityType),
        eq(comments.entityId, entityId),
        eq(comments.companyId, companyId),
      ))
      .orderBy(desc(comments.createdAt))
      .all()
      .reverse()
  },

  create(data: typeof comments.$inferInsert) {
    return db.insert(comments).values(data).returning().get()
  },

  resolve(id: string, companyId: string) {
    return db.update(comments)
      .set({ resolved: true })
      .where(and(eq(comments.id, id), eq(comments.companyId, companyId)))
      .returning()
      .get()
  },

  findAll(companyId: string, limit = 50) {
    return db.select().from(comments)
      .where(eq(comments.companyId, companyId))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .all()
  },
}
