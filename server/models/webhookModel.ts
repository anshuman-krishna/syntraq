import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { webhooks, webhookLogs } from '../db/schema'

export const webhookModel = {
  findAll(companyId: string) {
    return db.select().from(webhooks)
      .where(eq(webhooks.companyId, companyId))
      .orderBy(desc(webhooks.createdAt))
      .all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(webhooks)
      .where(and(eq(webhooks.id, id), eq(webhooks.companyId, companyId)))
      .get()
  },

  findActive(companyId: string) {
    return db.select().from(webhooks)
      .where(and(eq(webhooks.companyId, companyId), eq(webhooks.active, true)))
      .all()
  },

  create(data: typeof webhooks.$inferInsert) {
    return db.insert(webhooks).values(data).returning().get()
  },

  update(id: string, companyId: string, data: Partial<typeof webhooks.$inferInsert>) {
    return db.update(webhooks).set(data)
      .where(and(eq(webhooks.id, id), eq(webhooks.companyId, companyId)))
      .returning().get()
  },

  remove(id: string, companyId: string) {
    return db.delete(webhooks)
      .where(and(eq(webhooks.id, id), eq(webhooks.companyId, companyId)))
      .run()
  },

  incrementFailure(id: string) {
    const existing = db.select().from(webhooks).where(eq(webhooks.id, id)).get()
    if (!existing) return
    db.update(webhooks)
      .set({ failureCount: existing.failureCount + 1 })
      .where(eq(webhooks.id, id))
      .run()
  },

  resetFailure(id: string) {
    db.update(webhooks)
      .set({ failureCount: 0, lastTriggeredAt: new Date() })
      .where(eq(webhooks.id, id))
      .run()
  },

  // logs
  createLog(data: typeof webhookLogs.$inferInsert) {
    return db.insert(webhookLogs).values(data).returning().get()
  },

  findLogs(webhookId: string, companyId: string, limit = 20) {
    return db.select().from(webhookLogs)
      .where(and(eq(webhookLogs.webhookId, webhookId), eq(webhookLogs.companyId, companyId)))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit)
      .all()
  },
}
