import type { H3Event } from 'h3'
import { webhookService } from '../services/webhookService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { AppError } from '../services/authService'

export const webhookController = {
  list(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage webhooks')

    const webhooks = webhookService.list(user.companyId)
    return { webhooks }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'create webhook')

    const body = await readBody(event)
    const url = typeof body?.url === 'string' ? body.url : ''
    const eventTypes = Array.isArray(body?.eventTypes) ? body.eventTypes : []

    try {
      const webhook = webhookService.create(user.companyId, url, eventTypes)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'webhook.created',
        entityType: 'webhook',
        entityId: webhook.id,
        metadata: { url, eventTypes },
      })

      return { webhook }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async update(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'update webhook')

    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''
    if (!id) throw createError({ statusCode: 400, message: 'id is required' })

    const updates: { url?: string; eventTypes?: string[]; active?: boolean } = {}
    if (typeof body?.url === 'string') updates.url = body.url
    if (Array.isArray(body?.eventTypes)) updates.eventTypes = body.eventTypes
    if (typeof body?.active === 'boolean') updates.active = body.active

    try {
      const webhook = webhookService.update(id, user.companyId, updates)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'webhook.updated',
        entityType: 'webhook',
        entityId: id,
      })

      return { webhook }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async remove(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'delete webhook')

    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''
    if (!id) throw createError({ statusCode: 400, message: 'id is required' })

    try {
      webhookService.remove(id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'webhook.deleted',
        entityType: 'webhook',
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

  logs(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'view webhook logs')

    const query = getQuery(event)
    const webhookId = typeof query.webhookId === 'string' ? query.webhookId : ''
    if (!webhookId) throw createError({ statusCode: 400, message: 'webhookId is required' })

    const logs = webhookService.getLogs(webhookId, user.companyId)
    return { logs }
  },
}
