import { eq, and } from 'drizzle-orm'
import { db } from '../db/client'
import { onboardingProgress } from '../db/schema'

export const onboardingModel = {
  findByUser(userId: string, companyId: string) {
    return db.select()
      .from(onboardingProgress)
      .where(and(eq(onboardingProgress.userId, userId), eq(onboardingProgress.companyId, companyId)))
      .get()
  },

  create(data: typeof onboardingProgress.$inferInsert) {
    return db.insert(onboardingProgress).values(data).returning().get()
  },

  update(userId: string, companyId: string, data: Partial<typeof onboardingProgress.$inferInsert>) {
    return db.update(onboardingProgress)
      .set(data)
      .where(and(eq(onboardingProgress.userId, userId), eq(onboardingProgress.companyId, companyId)))
      .returning().get()
  },
}
