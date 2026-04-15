import { and, eq } from 'drizzle-orm'
import { db } from '../db/client'
import { oauthAccounts } from '../db/schema'

export type OauthProvider = 'google' | 'microsoft'

export const oauthAccountModel = {
  findByProvider(provider: OauthProvider, providerAccountId: string) {
    return db.select().from(oauthAccounts)
      .where(and(eq(oauthAccounts.provider, provider), eq(oauthAccounts.providerAccountId, providerAccountId)))
      .get()
  },

  findByUser(userId: string) {
    return db.select().from(oauthAccounts)
      .where(eq(oauthAccounts.userId, userId))
      .all()
  },

  create(data: typeof oauthAccounts.$inferInsert) {
    return db.insert(oauthAccounts).values(data).returning().get()
  },

  remove(id: string, userId: string) {
    return db.delete(oauthAccounts)
      .where(and(eq(oauthAccounts.id, id), eq(oauthAccounts.userId, userId)))
      .run()
  },
}
