import { generateId } from '../../shared/utils/id'
import { escalationModel } from '../models/escalationModel'
import { AppError } from './authService'

export const escalationService = {
  getAll(companyId: string, limit = 50) {
    return escalationModel.findAll(companyId, limit)
  },

  getOpen(companyId: string) {
    return escalationModel.findOpen(companyId)
  },

  create(data: {
    entityType: string
    entityId: string
    createdBy: string
    assignedTo: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    reason: string
    companyId: string
  }) {
    return escalationModel.create({
      id: generateId(),
      companyId: data.companyId,
      entityType: data.entityType,
      entityId: data.entityId,
      createdBy: data.createdBy,
      assignedTo: data.assignedTo,
      priority: data.priority,
      reason: data.reason,
    })
  },

  updateStatus(id: string, companyId: string, status: 'acknowledged' | 'resolved') {
    const existing = escalationModel.findById(id, companyId)
    if (!existing) throw new AppError('escalation not found', 404)
    return escalationModel.updateStatus(id, companyId, status)
  },
}
