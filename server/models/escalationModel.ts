import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { escalations } from '../db/schema'

export const escalationModel = {
  findAll(companyId: string, limit = 50) {
    return db.select().from(escalations)
      .where(eq(escalations.companyId, companyId))
      .orderBy(desc(escalations.createdAt))
      .limit(limit)
      .all()
  },

  findOpen(companyId: string) {
    return db.select().from(escalations)
      .where(and(eq(escalations.companyId, companyId), eq(escalations.status, 'open')))
      .orderBy(desc(escalations.createdAt))
      .all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(escalations)
      .where(and(eq(escalations.id, id), eq(escalations.companyId, companyId)))
      .get()
  },

  create(data: typeof escalations.$inferInsert) {
    return db.insert(escalations).values(data).returning().get()
  },

  updateStatus(id: string, companyId: string, status: 'acknowledged' | 'resolved') {
    const resolvedAt = status === 'resolved' ? new Date() : null
    return db.update(escalations)
      .set({ status, resolvedAt })
      .where(and(eq(escalations.id, id), eq(escalations.companyId, companyId)))
      .returning()
      .get()
  },
}
