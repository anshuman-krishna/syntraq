import type { H3Event } from 'h3'
import { z } from 'zod'
import { apiKeyService } from '../services/apiKeyService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { AppError } from '../services/authService'
import { apiError } from '../utils/errors'

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

function mapAppError(e: AppError, event: H3Event) {
  return apiError(e.statusCode === 404 ? 'not_found' : 'validation_error', e.message, undefined, event)
}

export const apiKeyController = {
  async list(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage api keys', event)
    return { keys: apiKeyService.list(user.companyId) }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'create api key', event)

    const parsed = createSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }

    try {
      const result = await apiKeyService.create(user.companyId, parsed.data.name, parsed.data.permissions)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.created',
        entityType: 'api_key',
        entityId: result.id,
        metadata: { name: parsed.data.name, permissions: parsed.data.permissions },
      })

      return { key: result }
    } catch (e) {
      if (e instanceof AppError) throw mapAppError(e, event)
      throw e
    }
  },

  async rotate(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'rotate api key', event)

    const parsed = idSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }

    try {
      const result = await apiKeyService.rotate(parsed.data.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.rotated',
        entityType: 'api_key',
        entityId: parsed.data.id,
      })

      return { key: result }
    } catch (e) {
      if (e instanceof AppError) throw mapAppError(e, event)
      throw e
    }
  },

  async revoke(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'revoke api key', event)

    const parsed = idSchema.safeParse(await readBody(event))
    if (!parsed.success) {
      throw apiError('validation_error', parsed.error.issues[0]?.message ?? 'invalid input', { issues: parsed.error.issues }, event)
    }

    try {
      apiKeyService.revoke(parsed.data.id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.revoked',
        entityType: 'api_key',
        entityId: parsed.data.id,
      })

      return { success: true }
    } catch (e) {
      if (e instanceof AppError) throw mapAppError(e, event)
      throw e
    }
  },
}
