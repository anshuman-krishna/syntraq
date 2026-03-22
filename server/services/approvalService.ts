import { generateId } from '../../shared/utils/id'
import { approvalModel } from '../models/approvalModel'
import { AppError } from './authService'

export const approvalService = {
  getPending(companyId: string, userId?: string) {
    return approvalModel.findPending(companyId, userId)
  },

  getAll(companyId: string, limit = 50) {
    return approvalModel.findAll(companyId, limit)
  },

  getByEntity(entityType: string, entityId: string, companyId: string) {
    return approvalModel.findByEntity(entityType, entityId, companyId)
  },

  requestApproval(data: {
    entityType: string
    entityId: string
    requestedBy: string
    assignedTo: string
    companyId: string
    note?: string
  }) {
    return approvalModel.create({
      id: generateId(),
      companyId: data.companyId,
      entityType: data.entityType,
      entityId: data.entityId,
      requestedBy: data.requestedBy,
      assignedTo: data.assignedTo,
      note: data.note ?? null,
    })
  },

  resolve(id: string, companyId: string, status: 'approved' | 'rejected', note?: string) {
    const existing = approvalModel.findById(id, companyId)
    if (!existing) throw new AppError('approval not found', 404)
    if (existing.status !== 'pending') throw new AppError('approval already resolved', 400)
    return approvalModel.updateStatus(id, companyId, status, note)
  },
}
