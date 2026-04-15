import { loggerService as logger } from '../services/loggerService'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    if (statusCode >= 500) {
      logger.error('server error', {
        requestId: event?.context?.requestId,
        path: event ? getRequestURL(event).pathname : undefined,
        method: event ? getMethod(event) : undefined,
        status: statusCode,
        message: error.message,
        stack: error.stack,
      })
    }
  })
})
