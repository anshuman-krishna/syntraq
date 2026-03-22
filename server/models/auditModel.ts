import { eq, desc, and } from 'drizzle-orm'
import { db } from '../db/client'
import { auditLogs } from '../db/schema'

export const auditModel = {
  create(data: typeof auditLogs.$inferInsert) {
    return db.insert(auditLogs).values(data).returning().get()
  },

  findByCompany(companyId: string, limit = 50) {
    return db.select().from(auditLogs)
      .where(eq(auditLogs.companyId, companyId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .all()
  },

  findByCompanyAndEntity(companyId: string, entityType: string, entityId: string) {
    return db.select().from(auditLogs)
      .where(
        and(
          eq(auditLogs.companyId, companyId),
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId),
        ),
      )
      .orderBy(desc(auditLogs.createdAt))
      .all()
  },
}
