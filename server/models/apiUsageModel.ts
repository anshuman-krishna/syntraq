import { eq, and, desc, gte } from 'drizzle-orm'
import { db } from '../db/client'
import { apiUsageLogs } from '../db/schema'

export const apiUsageModel = {
  create(data: typeof apiUsageLogs.$inferInsert) {
    return db.insert(apiUsageLogs).values(data).returning().get()
  },

  findByApiKey(apiKeyId: string, companyId: string, limit = 50) {
    return db.select().from(apiUsageLogs)
      .where(and(eq(apiUsageLogs.apiKeyId, apiKeyId), eq(apiUsageLogs.companyId, companyId)))
      .orderBy(desc(apiUsageLogs.createdAt))
      .limit(limit)
      .all()
  },

  findRecent(companyId: string, since: Date) {
    return db.select().from(apiUsageLogs)
      .where(and(eq(apiUsageLogs.companyId, companyId), gte(apiUsageLogs.createdAt, since)))
      .orderBy(desc(apiUsageLogs.createdAt))
      .all()
  },
}
