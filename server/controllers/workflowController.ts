import type { H3Event } from 'h3'
import { z } from 'zod'
import { workflowService } from '../services/workflowService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { realtimeService } from '../services/realtimeService'
import { usageService } from '../services/usageService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getParamsWithSchema, readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const workflowStepSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
}).passthrough()

const createWorkflowSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  steps: z.array(workflowStepSchema).min(1).max(50),
})

const updateWorkflowStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'archived']),
})

const workflowIdParamSchema = z.object({
  id: z.string().trim().min(1),
})

export const workflowController = {
  getAll(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewWorkflows(user), 'view workflows')
    const workflows = workflowService.getAll(user.companyId)
    return { workflows }
  },

  getById(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewWorkflows(user), 'view workflows')
    const { id } = getParamsWithSchema(event, workflowIdParamSchema)

    try {
      const workflow = workflowService.getById(id, user.companyId)
      return { workflow }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageWorkflows(user), 'manage workflows')
    usageService.checkWorkflowLimit(user.companyId)

    const body = await readBodyWithSchema(event, createWorkflowSchema)

    const steps = body.steps.map((step, i) => ({
      name: step.name ?? `step ${i + 1}`,
      description: step.description,
      order: i + 1,
    }))

    const workflow = workflowService.create({
      name: body.name,
      description: body.description,
      steps,
    }, user.id, user.companyId)

    auditService.log({
      companyId: user.companyId,
      userId: user.id,
      action: 'workflow.created',
      entityType: 'workflow',
      entityId: workflow.id,
    })

    realtimeService.broadcast({
      type: 'workflow_created',
      payload: { workflow },
      userId: user.id,
      userName: user.name,
      companyId: user.companyId,
      timestamp: new Date().toISOString(),
    })

    return { workflow }
  },

  async updateStatus(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageWorkflows(user), 'manage workflows')
    const { id } = getParamsWithSchema(event, workflowIdParamSchema)

    const body = await readBodyWithSchema(event, updateWorkflowStatusSchema)

    try {
      const workflow = workflowService.updateStatus(id, user.companyId, body.status)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: `workflow.${body.status}`,
        entityType: 'workflow',
        entityId: id,
      })

      realtimeService.broadcast({
        type: 'workflow_updated',
        payload: { workflow },
        userId: user.id,
        userName: user.name,
        companyId: user.companyId,
        timestamp: new Date().toISOString(),
      })

      return { workflow }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  remove(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageWorkflows(user), 'manage workflows')
    const { id } = getParamsWithSchema(event, workflowIdParamSchema)

    try {
      workflowService.remove(id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'workflow.deleted',
        entityType: 'workflow',
        entityId: id,
      })

      realtimeService.broadcast({
        type: 'workflow_deleted',
        payload: { workflowId: id },
        userId: user.id,
        userName: user.name,
        companyId: user.companyId,
        timestamp: new Date().toISOString(),
      })

      return { success: true }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
