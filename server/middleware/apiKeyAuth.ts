import { apiKeyService } from '../services/apiKeyService'
import { apiUsageModel } from '../models/apiUsageModel'
import { generateId } from '../../shared/utils/id'
import { loggerService } from '../services/loggerService'

// extends H3EventContext with api key info
declare module 'h3' {
  interface H3EventContext {
    apiKey?: {
      keyId: string
      companyId: string
      permissions: Record<string, boolean | undefined>
    }
  }
}

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // only process public api routes
  if (!path.startsWith('/api/public/')) return

  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'missing or invalid authorization header' })
  }

  const rawKey = authHeader.slice(7)
  if (!rawKey) {
    throw createError({ statusCode: 401, message: 'api key is required' })
  }

  const result = await apiKeyService.validate(rawKey)
  if (!result) {
    throw createError({ statusCode: 401, message: 'invalid api key' })
  }

  event.context.apiKey = {
    keyId: result.keyId,
    companyId: result.companyId,
    permissions: result.permissions as Record<string, boolean | undefined>,
  }

  // record usage once the response is flushed — never block or fail the request.
  const start = Date.now()
  event.node.res.on('finish', () => {
    try {
      apiUsageModel.create({
        id: generateId(),
        apiKeyId: result.keyId,
        companyId: result.companyId,
        method: getMethod(event),
        path,
        statusCode: event.node.res.statusCode,
        responseTime: Date.now() - start,
      })
    } catch (e) {
      loggerService.error('failed to record api usage', { error: e instanceof Error ? e.message : 'unknown' })
    }
  })
})
