export function reportClientError(scope: string, error: unknown, context?: Record<string, unknown>) {
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.error(`[syntraq:${scope}]`, error, context)
    return
  }

  // production: forward to the central error sink. fire-and-forget — telemetry
  // must never throw into the ui or block the failing flow.
  if (import.meta.client) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    $fetch('/api/monitoring/client-error', {
      method: 'POST',
      body: { scope, message, stack, url: window.location.href, context },
    }).catch(() => {})
  }
}
