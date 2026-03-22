import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { employees } from '../db/schema'

export const employeeModel = {
  findAll(companyId: string) {
    return db.select().from(employees).where(eq(employees.companyId, companyId)).all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(employees)
      .where(and(eq(employees.id, id), eq(employees.companyId, companyId)))
      .get()
  },

  create(data: typeof employees.$inferInsert) {
    return db.insert(employees).values(data).returning().get()
  },

  update(id: string, companyId: string, data: Partial<typeof employees.$inferInsert>) {
    return db.update(employees).set(data)
      .where(and(eq(employees.id, id), eq(employees.companyId, companyId)))
      .returning().get()
  },
}
