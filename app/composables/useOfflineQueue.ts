interface QueuedAction {
  id: string
  url: string
  method: string
  body?: unknown
  createdAt: string
  retries: number
}

const STORAGE_KEY = 'syntraq_offline_queue'
const MAX_RETRIES = 5
const RETRY_DELAY = 5000

const queue = ref<QueuedAction[]>([])
const online = ref(true)
const processing = ref(false)
let retryTimer: ReturnType<typeof setTimeout> | null = null

function loadQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) queue.value = JSON.parse(raw)
  } catch {
    queue.value = []
  }
}

function saveQueue() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value))
  } catch {
    // storage full — discard oldest
    queue.value = queue.value.slice(-10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value))
  }
}

export function useOfflineQueue() {
  const ui = useUiStore()

  function enqueue(url: string, method: string, body?: unknown): string {
    const id = Math.random().toString(36).slice(2)
    queue.value.push({
      id,
      url,
      method,
      body,
      createdAt: new Date().toISOString(),
      retries: 0,
    })
    saveQueue()
    scheduleRetry()
    return id
  }

  async function processQueue() {
    if (processing.value || !online.value || queue.value.length === 0) return
    processing.value = true

    const pending = [...queue.value]

    for (const action of pending) {
      try {
        await $fetch(action.url, {
          method: action.method as 'POST' | 'PUT' | 'DELETE',
          body: action.body,
        })

        // remove from queue on success
        queue.value = queue.value.filter(a => a.id !== action.id)
        saveQueue()
      } catch {
        action.retries++
        if (action.retries >= MAX_RETRIES) {
          queue.value = queue.value.filter(a => a.id !== action.id)
          saveQueue()
          ui.addToast({ type: 'error', message: `offline action failed after ${MAX_RETRIES} retries` })
        }
      }
    }

    processing.value = false

    if (queue.value.length > 0) {
      scheduleRetry()
    }
  }

  function scheduleRetry() {
    if (retryTimer || !online.value) return
    retryTimer = setTimeout(() => {
      retryTimer = null
      processQueue()
    }, RETRY_DELAY)
  }

  // wraps $fetch with offline fallback
  async function fetchWithOffline<T>(
    url: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T | null> {
    const method = options.method ?? 'GET'

    try {
      const result = await $fetch<T>(url, {
        method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        body: options.body,
      })
      return result
    } catch (e) {
      // only queue write operations
      if (method !== 'GET' && !online.value) {
        enqueue(url, method, options.body)
        ui.addToast({ type: 'info', message: 'saved offline — will sync when connected' })
        return null
      }
      throw e
    }
  }

  onMounted(() => {
    loadQueue()

    online.value = navigator.onLine

    window.addEventListener('online', () => {
      online.value = true
      ui.addToast({ type: 'success', message: 'back online' })
      processQueue()
    })

    window.addEventListener('offline', () => {
      online.value = false
      ui.addToast({ type: 'info', message: 'you are offline — changes will be saved locally' })
    })

    // process any pending items on load
    if (online.value && queue.value.length > 0) {
      processQueue()
    }
  })

  const pendingCount = computed(() => queue.value.length)

  return {
    online,
    pendingCount,
    processing,
    enqueue,
    fetchWithOffline,
    processQueue,
  }
}
