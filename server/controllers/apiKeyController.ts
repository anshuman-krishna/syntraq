import type { H3Event } from 'h3'
import { apiKeyService } from '../services/apiKeyService'
import { auditService } from '../services/auditService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { AppError } from '../services/authService'

export const apiKeyController = {
  async list(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage api keys')

    const keys = apiKeyService.list(user.companyId)
    return { keys }
  },

  async create(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'create api key')

    const body = await readBody(event)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const permissions = typeof body?.permissions === 'object' && body.permissions !== null
      ? body.permissions
      : {}

    if (!name) {
      throw createError({ statusCode: 400, message: 'name is required' })
    }

    try {
      const result = await apiKeyService.create(user.companyId, name, permissions)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.created',
        entityType: 'api_key',
        entityId: result.id,
        metadata: { name, permissions },
      })

      return { key: result }
    } catch (e) {
      if (e instanceof AppError) {
        throw createError({ statusCode: e.statusCode, message: e.message })
      }
      throw e
    }
  },

  async revoke(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'revoke api key')

    const body = await readBody(event)
    const id = typeof body?.id === 'string' ? body.id : ''

    if (!id) {
      throw createError({ statusCode: 400, message: 'id is required' })
    }

    try {
      apiKeyService.revoke(id, user.companyId)

      auditService.log({
        companyId: user.companyId,
        userId: user.id,
        action: 'api_key.revoked',
        entityType: 'api_key',
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
