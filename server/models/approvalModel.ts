import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { approvals } from '../db/schema'

export const approvalModel = {
  findByEntity(entityType: string, entityId: string, companyId: string) {
    return db.select().from(approvals)
      .where(and(
        eq(approvals.entityType, entityType),
        eq(approvals.entityId, entityId),
        eq(approvals.companyId, companyId),
      ))
      .orderBy(desc(approvals.createdAt))
      .all()
  },

  findPending(companyId: string, userId?: string) {
    if (userId) {
      return db.select().from(approvals)
        .where(and(
          eq(approvals.companyId, companyId),
          eq(approvals.assignedTo, userId),
          eq(approvals.status, 'pending'),
        ))
        .orderBy(desc(approvals.createdAt))
        .all()
    }
    return db.select().from(approvals)
      .where(and(eq(approvals.companyId, companyId), eq(approvals.status, 'pending')))
      .orderBy(desc(approvals.createdAt))
      .all()
  },

  findAll(companyId: string, limit = 50) {
    return db.select().from(approvals)
      .where(eq(approvals.companyId, companyId))
      .orderBy(desc(approvals.createdAt))
      .limit(limit)
      .all()
  },

  create(data: typeof approvals.$inferInsert) {
    return db.insert(approvals).values(data).returning().get()
  },

  updateStatus(id: string, companyId: string, status: 'approved' | 'rejected', note?: string) {
    return db.update(approvals)
      .set({ status, note: note ?? null, resolvedAt: new Date() })
      .where(and(eq(approvals.id, id), eq(approvals.companyId, companyId)))
      .returning()
      .get()
  },

  findById(id: string, companyId: string) {
    return db.select().from(approvals)
      .where(and(eq(approvals.id, id), eq(approvals.companyId, companyId)))
      .get()
  },
}
