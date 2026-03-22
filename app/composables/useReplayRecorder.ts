interface ReplayEvent {
  type: string
  route: string
  action?: string
  metadata?: string
  timestamp: string
}

const FLUSH_INTERVAL = 15_000
const MAX_BATCH = 50

export function useReplayRecorder() {
  const auth = useAuthStore()
  const route = useRoute()

  const sessionId = ref<string | null>(null)
  const recording = ref(false)
  const eventQueue: ReplayEvent[] = []
  let flushTimer: ReturnType<typeof setTimeout> | null = null
  let eventCount = 0

  async function start() {
    if (recording.value || !auth.isAuthenticated) return

    try {
      const data = await $fetch<{ session: { id: string } }>('/api/replay/start', {
        method: 'POST',
        body: { route: route.path },
      })
      sessionId.value = data.session.id
      recording.value = true
      eventCount = 0
      scheduleFlush()
    } catch {
      // non-critical
    }
  }

  async function stop() {
    if (!recording.value || !sessionId.value) return
    recording.value = false

    await flush()

    try {
      await $fetch('/api/replay/end', {
        method: 'POST',
        body: { sessionId: sessionId.value, eventCount },
      })
    } catch {
      // non-critical
    }

    sessionId.value = null
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
  }

  function record(type: string, action?: string, metadata?: string) {
    if (!recording.value || !sessionId.value) return

    eventQueue.push({
      type,
      route: route.path,
      action,
      metadata,
      timestamp: new Date().toISOString(),
    })

    if (eventQueue.length >= MAX_BATCH) flush()
  }

  async function flush() {
    if (eventQueue.length === 0 || !sessionId.value) return
    const batch = eventQueue.splice(0, MAX_BATCH)
    eventCount += batch.length

    try {
      await $fetch('/api/replay/events', {
        method: 'POST',
        body: { sessionId: sessionId.value, events: batch },
      })
    } catch {
      // non-critical
    }
  }

  function scheduleFlush() {
    if (flushTimer || !recording.value) return
    flushTimer = setTimeout(() => {
      flushTimer = null
      flush()
      if (recording.value) scheduleFlush()
    }, FLUSH_INTERVAL)
  }

  // auto-record route changes
  watch(() => route.path, () => {
    record('navigation', route.path)
  })

  onBeforeUnmount(() => {
    if (recording.value) stop()
  })

  return { sessionId, recording, start, stop, record }
}
