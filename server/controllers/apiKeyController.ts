import type { H3Event } from 'h3'
import { z } from 'zod'
import { apiKeyService } from '../services/apiKeyService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { readBodyWithSchema, rethrowAsApiError } from '../utils/validation'

const permissionsSchema = z.object({
  employees: z.boolean().optional(),
  shifts: z.boolean().optional(),
  vehicles: z.boolean().optional(),
  workflows: z.boolean().optional(),
}).default({})

const createSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  permissions: permissionsSchema,
})

const idSchema = z.object({ id: z.string().min(1) })

export const apiKeyController = {
  async list(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage api keys', event)
    return { keys: apiKeyService.list(user.companyId) }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'create api key', event)

    const body = await readBodyWithSchema(event, createSchema)

    try {
      const result = await apiKeyService.create(user.companyId, body.name, body.permissions)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.created',
        entityType: 'api_key',
        entityId: result.id,
        metadata: { name: body.name, permissions: body.permissions },
      })

      return { key: result }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async rotate(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'rotate api key', event)

    const body = await readBodyWithSchema(event, idSchema)

    try {
      const result = await apiKeyService.rotate(body.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.rotated',
        entityType: 'api_key',
        entityId: body.id,
      })

      return { key: result }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },

  async revoke(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'revoke api key', event)

    const body = await readBodyWithSchema(event, idSchema)

    try {
      apiKeyService.revoke(body.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.revoked',
        entityType: 'api_key',
        entityId: body.id,
      })

      return { success: true }
    } catch (e) {
      rethrowAsApiError(e, event)
    }
  },
}
