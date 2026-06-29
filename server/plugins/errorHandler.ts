import { errorTrackingService } from '../services/errorTrackingService'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    if (statusCode >= 500) {
      errorTrackingService.capture({
        source: 'server',
        scope: event ? `${getMethod(event)} ${getRequestURL(event).pathname}` : 'server',
        message: error.message,
        stack: error.stack,
        url: event ? getRequestURL(event).pathname : undefined,
        requestId: event?.context?.requestId,
        context: { status: statusCode },
      })
    }
  })
})
