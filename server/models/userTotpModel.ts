import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { userTotp } from '../db/schema'

export const userTotpModel = {
  findByUser(userId: string) {
    return db.select().from(userTotp).where(eq(userTotp.userId, userId)).get()
  },

  upsert(data: typeof userTotp.$inferInsert) {
    const existing = this.findByUser(data.userId)
    if (existing) {
      return db.update(userTotp)
        .set({
          secret: data.secret,
          verifiedAt: data.verifiedAt ?? null,
          recoveryCodesHash: data.recoveryCodesHash ?? null,
        })
        .where(eq(userTotp.userId, data.userId))
        .run()
    }
    return db.insert(userTotp).values(data).run()
  },

  markVerified(userId: string) {
    return db.update(userTotp)
      .set({ verifiedAt: new Date() })
      .where(eq(userTotp.userId, userId))
      .run()
  },

  remove(userId: string) {
    return db.delete(userTotp).where(eq(userTotp.userId, userId)).run()
  },
}
