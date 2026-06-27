import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { shiftTemplates } from '../db/schema'

export const shiftTemplateModel = {
  findByCompany(companyId: string) {
    return db.select().from(shiftTemplates)
      .where(eq(shiftTemplates.companyId, companyId))
      .orderBy(desc(shiftTemplates.createdAt))
      .all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(shiftTemplates)
      .where(and(eq(shiftTemplates.id, id), eq(shiftTemplates.companyId, companyId)))
      .get()
  },

  create(data: typeof shiftTemplates.$inferInsert) {
    return db.insert(shiftTemplates).values(data).returning().get()
  },

  remove(id: string, companyId: string) {
    return db.delete(shiftTemplates)
      .where(and(eq(shiftTemplates.id, id), eq(shiftTemplates.companyId, companyId)))
      .run()
  },
}
