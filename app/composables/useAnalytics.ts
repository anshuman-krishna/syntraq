interface AnalyticsEvent {
  category: 'page_view' | 'feature' | 'engagement'
  action: string
  label?: string
  value?: number
}

const buffer: AnalyticsEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null
const FLUSH_MS = 15_000
const MAX_BUFFER = 50

async function flush() {
  if (buffer.length === 0) return
  const batch = buffer.splice(0, MAX_BUFFER)

  try {
    await $fetch('/api/analytics/track', {
      method: 'POST',
      body: { events: batch },
    })
  } catch {
    // analytics is non-critical — drop silently
  }
}

function scheduleFlush() {
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    flush()
  }, FLUSH_MS)
}

function push(event: AnalyticsEvent) {
  buffer.push(event)
  if (buffer.length >= MAX_BUFFER) {
    flush()
  } else {
    scheduleFlush()
  }
}

export function useAnalytics() {
  const route = useRoute()
  const config = useRuntimeConfig()

  const enabled = computed(() => config.public.analyticsEnabled)

  function trackPageView(path?: string) {
    if (!enabled.value) return
    push({ category: 'page_view', action: path ?? route.path })
  }

  function trackFeature(feature: string, label?: string) {
    if (!enabled.value) return
    push({ category: 'feature', action: feature, label })
  }

  function trackEngagement(action: string, value?: number) {
    if (!enabled.value) return
    push({ category: 'engagement', action, value })
  }

  // auto-track route changes
  watch(() => route.path, (path) => {
    trackPageView(path)
  })

  onBeforeUnmount(() => {
    flush()
  })

  return { trackPageView, trackFeature, trackEngagement }
}
