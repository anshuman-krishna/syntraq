import { and, eq, isNull, lt } from 'drizzle-orm'
import { db } from '../db/client'
import { passwordResetTokens } from '../db/schema'

export const passwordResetTokenModel = {
  create(data: typeof passwordResetTokens.$inferInsert) {
    return db.insert(passwordResetTokens).values(data).returning().get()
  },

  findByHash(tokenHash: string) {
    return db.select().from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .get()
  },

  markUsed(id: string) {
    return db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id))
      .run()
  },

  invalidateForUser(userId: string) {
    return db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)))
      .run()
  },

  deleteExpired() {
    return db.delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()))
      .run()
  },
}
