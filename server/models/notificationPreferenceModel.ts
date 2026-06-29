import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { notificationPreferences } from '../db/schema'

export const notificationPreferenceModel = {
  find(userId: string) {
    return db.select().from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .get()
  },

  upsert(userId: string, companyId: string, preferences: string) {
    return db.insert(notificationPreferences)
      .values({ userId, companyId, preferences, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: { preferences, updatedAt: new Date() },
      })
      .returning().get()
  },
}
