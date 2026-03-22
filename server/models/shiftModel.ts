import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { shifts } from '../db/schema'

export const shiftModel = {
  findAll() {
    return db.select().from(shifts).orderBy(desc(shifts.date)).all()
  },

  findById(id: string) {
    return db.select().from(shifts).where(eq(shifts.id, id)).get()
  },

  findByEmployeeId(employeeId: string) {
    return db.select().from(shifts).where(eq(shifts.employeeId, employeeId)).orderBy(desc(shifts.date)).all()
  },

  findByDate(date: string) {
    return db.select().from(shifts).where(eq(shifts.date, date)).all()
  },

  findByStatus(status: string) {
    return db.select().from(shifts).where(eq(shifts.status, status)).all()
  },

  create(data: typeof shifts.$inferInsert) {
    return db.insert(shifts).values(data).returning().get()
  },

  update(id: string, data: Partial<typeof shifts.$inferInsert>) {
    return db.update(shifts).set(data).where(eq(shifts.id, id)).returning().get()
  },
}
