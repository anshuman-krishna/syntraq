import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { vehicles } from '../db/schema'

export const vehicleModel = {
  findAll() {
    return db.select().from(vehicles).all()
  },

  findById(id: string) {
    return db.select().from(vehicles).where(eq(vehicles.id, id)).get()
  },

  create(data: typeof vehicles.$inferInsert) {
    return db.insert(vehicles).values(data).returning().get()
  },

  update(id: string, data: Partial<typeof vehicles.$inferInsert>) {
    return db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning().get()
  },
}
