import { loggerService as logger } from '../services/loggerService'

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const start = Date.now()

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    setResponseHeader(event, 'Server-Timing', `total;dur=${duration}`)

    if (duration > 1000) {
      logger.warn('slow request', {
        requestId: event.context.requestId,
        method: getMethod(event),
        path,
        durationMs: duration,
      })
    }
  })
})
