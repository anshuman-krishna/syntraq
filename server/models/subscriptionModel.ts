import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { subscriptions } from '../db/schema'

export const subscriptionModel = {
  findByCompany(companyId: string) {
    return db.select()
      .from(subscriptions)
      .where(and(eq(subscriptions.companyId, companyId), eq(subscriptions.status, 'active')))
      .get()
  },

  create(data: typeof subscriptions.$inferInsert) {
    return db.insert(subscriptions).values(data).returning().get()
  },

  update(id: string, data: Partial<typeof subscriptions.$inferInsert>) {
    return db.update(subscriptions).set(data)
      .where(eq(subscriptions.id, id))
      .returning().get()
  },
}
