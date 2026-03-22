import type { H3Event } from 'h3'
import { automationService } from '../services/automationService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { AppError } from '../services/authService'

export const automationController = {
  list(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage automations')

    const automations = automationService.list(user.companyId)
    return { automations }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'create automation')

    const body = await readBody(event)
    const name = typeof body?.name === 'string' ? body.name : ''
    const trigger = typeof body?.trigger === 'string' ? body.trigger : ''
    const conditions = Array.isArray(body?.conditions) ? body.conditions : []
    const actions = Array.isArray(body?.actions) ? body.actions : []

    try {
      const automation = automationService.create(
        user.companyId, user.id, name, trigger, conditions, actions,
      )

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'automation.created',
        entityType: 'automation',
        entityId: automation.id,
      })

      return { automation }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async update(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'update automation')

    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''
    if (!id) throw createError({ statusCode: 400, message: 'id is required' })

    const updates: Record<string, unknown> = {}
    if (typeof body?.name === 'string') updates.name = body.name
    if (Array.isArray(body?.conditions)) updates.conditions = body.conditions
    if (Array.isArray(body?.actions)) updates.actions = body.actions
    if (typeof body?.active === 'boolean') updates.active = body.active

    try {
      const automation = automationService.update(id, user.companyId, updates)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'automation.updated',
        entityType: 'automation',
        entityId: id,
      })

      return { automation }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async remove(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'delete automation')

    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''
    if (!id) throw createError({ statusCode: 400, message: 'id is required' })

    try {
      automationService.remove(id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'automation.deleted',
        entityType: 'automation',
        entityId: id,
      })

      return { success: true }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },
}
