import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { employees } from '../db/schema'

export const employeeModel = {
  findAll() {
    return db.select().from(employees).all()
  },

  findById(id: string) {
    return db.select().from(employees).where(eq(employees.id, id)).get()
  },

  create(data: typeof employees.$inferInsert) {
    return db.insert(employees).values(data).returning().get()
  },

  update(id: string, data: Partial<typeof employees.$inferInsert>) {
    return db.update(employees).set(data).where(eq(employees.id, id)).returning().get()
  },
}
