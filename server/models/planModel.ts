import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { plans } from '../db/schema'

export const planModel = {
  findById(id: string) {
    return db.select().from(plans).where(eq(plans.id, id)).get()
  },

  findByName(name: string) {
    return db.select().from(plans).where(eq(plans.name, name)).get()
  },

  findAll() {
    return db.select().from(plans).all()
  },

  create(data: typeof plans.$inferInsert) {
    return db.insert(plans).values(data).returning().get()
  },
}
