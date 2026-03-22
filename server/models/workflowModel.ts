import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { workflows } from '../db/schema'

export const workflowModel = {
  findAll(companyId: string) {
    return db.select().from(workflows)
      .where(eq(workflows.companyId, companyId))
      .orderBy(desc(workflows.createdAt))
      .all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.companyId, companyId)))
      .get()
  },

  create(data: typeof workflows.$inferInsert) {
    return db.insert(workflows).values(data).returning().get()
  },

  update(id: string, companyId: string, data: Partial<typeof workflows.$inferInsert>) {
    return db.update(workflows).set({ ...data, updatedAt: new Date() })
      .where(and(eq(workflows.id, id), eq(workflows.companyId, companyId)))
      .returning().get()
  },

  remove(id: string, companyId: string) {
    return db.delete(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.companyId, companyId)))
      .run()
  },
}
