import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { shifts } from '../db/schema'

export const shiftModel = {
  findAll(companyId: string) {
    return db.select().from(shifts)
      .where(eq(shifts.companyId, companyId))
      .orderBy(desc(shifts.date))
      .all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(shifts)
      .where(and(eq(shifts.id, id), eq(shifts.companyId, companyId)))
      .get()
  },

  findByEmployeeId(employeeId: string, companyId: string) {
    return db.select().from(shifts)
      .where(and(eq(shifts.employeeId, employeeId), eq(shifts.companyId, companyId)))
      .orderBy(desc(shifts.date))
      .all()
  },

  findByDate(date: string, companyId: string) {
    return db.select().from(shifts)
      .where(and(eq(shifts.date, date), eq(shifts.companyId, companyId)))
      .all()
  },

  findByStatus(status: string, companyId: string) {
    return db.select().from(shifts)
      .where(and(eq(shifts.status, status), eq(shifts.companyId, companyId)))
      .all()
  },

  create(data: typeof shifts.$inferInsert) {
    return db.insert(shifts).values(data).returning().get()
  },

  update(id: string, companyId: string, data: Partial<typeof shifts.$inferInsert>) {
    return db.update(shifts).set(data)
      .where(and(eq(shifts.id, id), eq(shifts.companyId, companyId)))
      .returning().get()
  },
}
