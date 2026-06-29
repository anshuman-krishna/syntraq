import { loggerService } from './loggerService'

export interface CapturedError {
  source: 'client' | 'server'
  scope: string
  message: string
  stack?: string
  url?: string
  requestId?: string
  context?: Record<string, unknown>
}

// central sink for errors from both ends. always logs through loggerService;
// when ERROR_WEBHOOK_URL is set it additionally forwards the payload (sentry,
// slack, a custom collector — anything that accepts a json post). forwarding is
// fire-and-forget and never blocks or throws into the request path.
export const errorTrackingService = {
  capture(error: CapturedError) {
    loggerService.error(`captured.${error.source}`, {
      scope: error.scope,
      message: error.message,
      url: error.url,
      requestId: error.requestId,
      ...error.context,
    })

    const sink = process.env.ERROR_WEBHOOK_URL
    if (sink) void this.forward(sink, error)
  },

  async forward(url: string, error: CapturedError) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
        signal: AbortSignal.timeout(3000),
      })
    } catch (e) {
      loggerService.warn('error sink delivery failed', { error: e instanceof Error ? e.message : 'unknown' })
    }
  },
}
