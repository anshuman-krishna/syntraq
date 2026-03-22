interface BehaviorEvent {
  type: 'page_visit' | 'action' | 'hesitation'
  route: string
  action?: string
  metadata?: string
  timestamp: string
}

const queue: BehaviorEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
const FLUSH_INTERVAL = 10_000
const MAX_BATCH = 30

async function flush() {
  if (queue.length === 0) return
  const batch = queue.splice(0, MAX_BATCH)

  try {
    await $fetch('/api/behavior/track', {
      method: 'POST',
      body: { events: batch },
    })
  } catch {
    // silently discard — behavior tracking is non-critical
  }
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flush()
  }, FLUSH_INTERVAL)
}

export function useBehavior() {
  const route = useRoute()
  const auth = useAuthStore()

  function track(type: BehaviorEvent['type'], action?: string, metadata?: string) {
    if (!auth.isAuthenticated) return

    queue.push({
      type,
      route: route.path,
      action,
      metadata,
      timestamp: new Date().toISOString(),
    })

    if (queue.length >= MAX_BATCH) {
      flush()
    } else {
      scheduleFlush()
    }
  }

  function trackPageVisit() {
    track('page_visit')
  }

  function trackAction(action: string, metadata?: string) {
    track('action', action, metadata)
  }

  function trackHesitation() {
    track('hesitation')
  }

  // auto-track route changes
  watch(() => route.path, () => {
    trackPageVisit()
  })

  // flush on unmount
  onBeforeUnmount(() => {
    flush()
  })

  return { trackAction, trackHesitation, trackPageVisit }
}
