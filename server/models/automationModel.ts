import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { automations } from '../db/schema'

export const automationModel = {
  findAll(companyId: string) {
    return db.select().from(automations)
      .where(eq(automations.companyId, companyId))
      .orderBy(desc(automations.createdAt))
      .all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(automations)
      .where(and(eq(automations.id, id), eq(automations.companyId, companyId)))
      .get()
  },

  findActive(companyId: string) {
    return db.select().from(automations)
      .where(and(eq(automations.companyId, companyId), eq(automations.active, true)))
      .all()
  },

  findByTrigger(trigger: string, companyId: string) {
    return db.select().from(automations)
      .where(and(
        eq(automations.trigger, trigger),
        eq(automations.companyId, companyId),
        eq(automations.active, true),
      ))
      .all()
  },

  create(data: typeof automations.$inferInsert) {
    return db.insert(automations).values(data).returning().get()
  },

  update(id: string, companyId: string, data: Partial<typeof automations.$inferInsert>) {
    return db.update(automations).set(data)
      .where(and(eq(automations.id, id), eq(automations.companyId, companyId)))
      .returning().get()
  },

  incrementTriggerCount(id: string) {
    const existing = db.select().from(automations).where(eq(automations.id, id)).get()
    if (!existing) return
    db.update(automations)
      .set({ triggerCount: existing.triggerCount + 1, lastTriggeredAt: new Date() })
      .where(eq(automations.id, id))
      .run()
  },

  remove(id: string, companyId: string) {
    return db.delete(automations)
      .where(and(eq(automations.id, id), eq(automations.companyId, companyId)))
      .run()
  },
}
