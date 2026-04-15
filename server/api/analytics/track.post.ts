import { loggerService as logger } from '../../services/loggerService'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.events || !Array.isArray(body.events)) {
    return { ok: true }
  }

  if (process.env.NODE_ENV !== 'production') {
    logger.debug('analytics events received', {
      requestId: event.context.requestId,
      count: body.events.length,
    })
  }

  return { ok: true }
})
