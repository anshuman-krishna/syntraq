export function reportClientError(scope: string, error: unknown, context?: Record<string, unknown>) {
  if (import.meta.dev) {
    // eslint-disable-next-line no-console
    console.error(`[syntraq:${scope}]`, error, context)
  }

  // production telemetry can be wired here later without changing call sites.
}
