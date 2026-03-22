import { generateId } from '../../shared/utils/id'
import { workflowModel } from '../models/workflowModel'
import { AppError } from './authService'
import type { WorkflowCreateInput, WorkflowStep } from '../../shared/types/workflow'

function formatRow(r: { steps: string; createdAt: Date | number; updatedAt: Date | number; [key: string]: unknown }) {
  return {
    ...r,
    steps: JSON.parse(r.steps as string) as WorkflowStep[],
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt as number).toISOString(),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : new Date(r.updatedAt as number).toISOString(),
  }
}

export const workflowService = {
  getAll(companyId: string) {
    return workflowModel.findAll(companyId).map(formatRow)
  },

  getById(id: string, companyId: string) {
    const row = workflowModel.findById(id, companyId)
    if (!row) throw new AppError('workflow not found', 404)
    return formatRow(row)
  },

  create(input: WorkflowCreateInput, userId: string, companyId: string) {
    const steps: WorkflowStep[] = input.steps.map((s, i) => ({
      ...s,
      id: generateId(),
      order: i + 1,
    }))

    const row = workflowModel.create({
      id: generateId(),
      companyId,
      name: input.name,
      description: input.description ?? null,
      steps: JSON.stringify(steps),
      status: 'draft',
      createdBy: userId,
    })

    return formatRow(row)
  },

  updateStatus(id: string, companyId: string, status: 'draft' | 'active' | 'archived') {
    const existing = workflowModel.findById(id, companyId)
    if (!existing) throw new AppError('workflow not found', 404)
    workflowModel.update(id, companyId, { status })
    return this.getById(id, companyId)
  },

  remove(id: string, companyId: string) {
    const existing = workflowModel.findById(id, companyId)
    if (!existing) throw new AppError('workflow not found', 404)
    workflowModel.remove(id, companyId)
  },
}
