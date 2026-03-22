import type { H3Event } from 'h3'
import { workflowService } from '../services/workflowService'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { realtimeService } from '../services/realtimeService'
import { usageService } from '../services/usageService'
import { AppError } from '../services/authService'
import { requireAuth, requirePermission } from '../utils/auth'

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
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'id required' })

    try {
      const workflow = workflowService.getById(id, user.companyId)
      return { workflow }
    } catch (e) {
      if (e instanceof AppError) throw createError({ statusCode: e.statusCode, message: e.message })
      throw e
    }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageWorkflows(user), 'manage workflows')
    usageService.checkWorkflowLimit(user.companyId)

    const body = await readBody(event)

    if (!body?.name || typeof body.name !== 'string' || body.name.length > 100) {
      throw createError({ statusCode: 400, message: 'name is required (max 100 chars)' })
    }

    if (!Array.isArray(body?.steps) || body.steps.length === 0 || body.steps.length > 50) {
      throw createError({ statusCode: 400, message: 'steps must be an array of 1-50 items' })
    }

    const steps = body.steps.map((s: Record<string, unknown>, i: number) => ({
      name: typeof s.name === 'string' ? s.name : `step ${i + 1}`,
      description: typeof s.description === 'string' ? s.description : undefined,
      order: i + 1,
    }))

    const workflow = workflowService.create({
      name: body.name.trim(),
      description: typeof body.description === 'string' ? body.description.trim() : undefined,
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
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'id required' })

    const body = await readBody(event)
    const validStatuses = ['draft', 'active', 'archived'] as const
    if (!validStatuses.includes(body?.status)) {
      throw createError({ statusCode: 400, message: 'invalid status' })
    }

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
      if (e instanceof AppError) throw createError({ statusCode: e.statusCode, message: e.message })
      throw e
    }
  },

  remove(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageWorkflows(user), 'manage workflows')
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, message: 'id required' })

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
      if (e instanceof AppError) throw createError({ statusCode: e.statusCode, message: e.message })
      throw e
    }
  },
}
