import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { vehicles } from '../db/schema'

export const vehicleModel = {
  findAll(companyId: string) {
    return db.select().from(vehicles).where(eq(vehicles.companyId, companyId)).all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(vehicles)
      .where(and(eq(vehicles.id, id), eq(vehicles.companyId, companyId)))
      .get()
  },

  create(data: typeof vehicles.$inferInsert) {
    return db.insert(vehicles).values(data).returning().get()
  },

  update(id: string, companyId: string, data: Partial<typeof vehicles.$inferInsert>) {
    return db.update(vehicles).set(data)
      .where(and(eq(vehicles.id, id), eq(vehicles.companyId, companyId)))
      .returning().get()
  },
}
