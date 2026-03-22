import { generateId } from '../../shared/utils/id'
import { auditModel } from '../models/auditModel'

interface AuditEntry {
  companyId: string
  userId: string
  action: string
  entityType: string
  entityId?: string
  metadata?: Record<string, unknown>
}

export const auditService = {
  log(entry: AuditEntry) {
    return auditModel.create({
      id: generateId(),
      companyId: entry.companyId,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    })
  },

  getCompanyLogs(companyId: string, limit = 50) {
    const logs = auditModel.findByCompany(companyId, limit)
    return logs.map(l => ({
      ...l,
      metadata: l.metadata ? JSON.parse(l.metadata) : null,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : new Date(l.createdAt).toISOString(),
    }))
  },
}
