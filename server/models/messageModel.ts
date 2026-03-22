import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import { messages } from '../db/schema'

export const messageModel = {
  findByChannel(channelId: string, companyId: string, limit = 50) {
    return db.select().from(messages)
      .where(and(eq(messages.channelId, channelId), eq(messages.companyId, companyId)))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .all()
      .reverse()
  },

  create(data: typeof messages.$inferInsert) {
    return db.insert(messages).values(data).returning().get()
  },

  findById(id: string, companyId: string) {
    return db.select().from(messages)
      .where(and(eq(messages.id, id), eq(messages.companyId, companyId)))
      .get()
  },
}
