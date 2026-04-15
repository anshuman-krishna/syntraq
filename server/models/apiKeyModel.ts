import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { apiKeys } from '../db/schema'

export const apiKeyModel = {
  findAll(companyId: string) {
    return db.select().from(apiKeys)
      .where(eq(apiKeys.companyId, companyId))
      .orderBy(desc(apiKeys.createdAt))
      .all()
  },

  findById(id: string, companyId: string) {
    return db.select().from(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)))
      .get()
  },

  findByPrefix(prefix: string) {
    return db.select().from(apiKeys)
      .where(eq(apiKeys.keyPrefix, prefix))
      .all()
  },

  create(data: typeof apiKeys.$inferInsert) {
    return db.insert(apiKeys).values(data).returning().get()
  },

  updateLastUsed(id: string) {
    return db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .run()
  },

  rotate(id: string, companyId: string, keyHash: string, keyPrefix: string) {
    return db.update(apiKeys)
      .set({ keyHash, keyPrefix, lastUsedAt: null })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)))
      .run()
  },

  remove(id: string, companyId: string) {
    return db.delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)))
      .run()
  },
}
