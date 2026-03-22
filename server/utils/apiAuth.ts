import type { H3Event } from 'h3'
import { apiKeyService } from '../services/apiKeyService'

export interface ApiKeyContext {
  keyId: string
  companyId: string
  permissions: Record<string, boolean | undefined>
}

export function requireApiKey(event: H3Event): ApiKeyContext {
  const ctx = event.context.apiKey
  if (!ctx) {
    throw createError({ statusCode: 401, message: 'api key authentication required' })
  }
  return ctx
}

export function requireApiPermission(ctx: ApiKeyContext, resource: string) {
  if (!apiKeyService.hasPermission(ctx.permissions, resource)) {
    throw createError({ statusCode: 403, message: `api key lacks permission for: ${resource}` })
  }
}
