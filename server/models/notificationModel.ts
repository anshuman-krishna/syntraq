import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { notifications } from '../db/schema'

export const notificationModel = {
  findByUser(userId: string, companyId: string, limit = 30) {
    return db.select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.companyId, companyId)))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .all()
  },

  countUnread(userId: string, companyId: string) {
    const rows = db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.companyId, companyId),
        eq(notifications.read, false),
      ))
      .all()
    return rows.length
  },

  create(data: typeof notifications.$inferInsert) {
    return db.insert(notifications).values(data).returning().get()
  },

  markRead(id: string, userId: string) {
    return db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning().get()
  },

  markAllRead(userId: string, companyId: string) {
    db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.companyId, companyId)))
      .run()
  },
}
