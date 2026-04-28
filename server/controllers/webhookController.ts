import type { H3Event } from 'h3'
import { z } from 'zod'
import { webhookService } from '../services/webhookService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { getQueryWithSchema, readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const webhookCreateSchema = z.object({
  url: z.string().trim().min(1),
  eventTypes: z.array(z.string().trim().min(1)).min(1),
})

const webhookUpdateSchema = z.object({
  id: z.string().trim().min(1),
  url: z.string().trim().min(1).optional(),
  eventTypes: z.array(z.string().trim().min(1)).min(1).optional(),
  active: z.boolean().optional(),
})

const webhookIdSchema = z.object({
  id: z.string().trim().min(1),
})

const webhookLogsQuerySchema = z.object({
  webhookId: z.string().trim().min(1),
})

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

    const body = await readBodyWithSchema(event, webhookCreateSchema)

    try {
      const webhook = webhookService.create(user.companyId, body.url, body.eventTypes)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'webhook.created',
        entityType: 'webhook',
        entityId: webhook.id,
        metadata: { url: body.url, eventTypes: body.eventTypes },
      })

      return { webhook }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async update(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'update webhook')

    const body = await readBodyWithSchema(event, webhookUpdateSchema)

    try {
      const webhook = webhookService.update(body.id, user.companyId, {
        url: body.url,
        eventTypes: body.eventTypes,
        active: body.active,
      })

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'webhook.updated',
        entityType: 'webhook',
        entityId: body.id,
      })

      return { webhook }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async remove(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'delete webhook')

    const body = await readBodyWithSchema(event, webhookIdSchema)

    try {
      webhookService.remove(body.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'webhook.deleted',
        entityType: 'webhook',
        entityId: body.id,
      })

      return { success: true }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  logs(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'view webhook logs')

    const query = getQueryWithSchema(event, webhookLogsQuerySchema)

    const logs = webhookService.getLogs(query.webhookId, user.companyId)
    return { logs }
  },
}
