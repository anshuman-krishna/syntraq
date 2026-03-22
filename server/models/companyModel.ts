import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { companies } from '../db/schema'

export const companyModel = {
  findById(id: string) {
    return db.select().from(companies).where(eq(companies.id, id)).get()
  },

  create(data: typeof companies.$inferInsert) {
    return db.insert(companies).values(data).returning().get()
  },
}
