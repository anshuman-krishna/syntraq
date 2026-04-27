import type { RealtimeEvent, PresenceInfo } from '@shared/types/realtime'
import type { Shift } from '@shared/types/roster'
import type { Workflow } from '@shared/types/workflow'

let eventSource: EventSource | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let presenceTimer: ReturnType<typeof setInterval> | null = null
let activeConsumers = 0
let stopAuthWatch: ReturnType<typeof watch> | null = null
let stopRouteWatch: ReturnType<typeof watch> | null = null
const RECONNECT_DELAY = 3000
const PRESENCE_INTERVAL = 20_000

const connected = ref(false)
const presence = ref<PresenceInfo[]>([])
const eventListeners: Array<(event: RealtimeEvent) => void> = []

export function useRealtime() {
  const auth = useAuthStore()
  const roster = useRosterStore()
  const workflowStore = useWorkflowStore()
  const ui = useUiStore()
  const route = useRoute()

  function handleEvent(event: RealtimeEvent) {
    // skip own events for store updates (already applied optimistically)
    const isSelf = event.userId === auth.user?.id

    switch (event.type) {
      case 'shift_updated': {
        if (isSelf) break
        const shift = event.payload.shift as Shift
        const idx = roster.shifts.findIndex(s => s.id === shift.id)
        if (idx !== -1) roster.shifts[idx] = shift
        break
      }
      case 'shift_created': {
        if (isSelf) break
        const shift = event.payload.shift as Shift
        if (!roster.shifts.find(s => s.id === shift.id)) {
          roster.shifts.push(shift)
        }
        break
      }
      case 'workflow_updated': {
        if (isSelf) break
        const workflow = event.payload.workflow as Workflow
        const idx = workflowStore.workflows.findIndex(w => w.id === workflow.id)
        if (idx !== -1) workflowStore.workflows[idx] = workflow
        break
      }
      case 'workflow_created': {
        if (isSelf) break
        const workflow = event.payload.workflow as Workflow
        if (!workflowStore.workflows.find(w => w.id === workflow.id)) {
          workflowStore.workflows.unshift(workflow)
        }
        break
      }
      case 'workflow_deleted': {
        if (isSelf) break
        const id = event.payload.workflowId as string
        workflowStore.workflows = workflowStore.workflows.filter(w => w.id !== id)
        break
      }
      case 'activity_created': {
        // notify listeners (e.g. dashboard)
        break
      }
      case 'presence_update': {
        presence.value = event.payload.presence as PresenceInfo[]
        break
      }
    }

    // notify external listeners
    eventListeners.forEach(fn => fn(event))

    // show toast for other users' actions
    if (!isSelf && event.type !== 'presence_update') {
      const actionLabel = event.type.replace(/_/g, ' ')
      ui.addToast({
        type: 'info',
        message: `${event.userName} — ${actionLabel}`,
      })
    }
  }

  function onEvent(fn: (event: RealtimeEvent) => void) {
    eventListeners.push(fn)
    return () => {
      const idx = eventListeners.indexOf(fn)
      if (idx !== -1) eventListeners.splice(idx, 1)
    }
  }

  function connect() {
    if (!auth.isAuthenticated || eventSource) return

    eventSource = new EventSource('/api/realtime')

    eventSource.onopen = () => {
      connected.value = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'connected') {
          presence.value = data.presence ?? []
          return
        }
        handleEvent(data as RealtimeEvent)
      } catch {
        // malformed event — skip
      }
    }

    eventSource.onerror = () => {
      connected.value = false
      disconnect()
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY)
    }
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    connected.value = false
  }

  function startPresence() {
    if (presenceTimer) return
    sendPresence()
    presenceTimer = setInterval(sendPresence, PRESENCE_INTERVAL)
  }

  function sendPresence(action: 'viewing' | 'editing' = 'viewing', entityId?: string) {
    if (!auth.isAuthenticated) return
    $fetch('/api/realtime/presence', {
      method: 'POST',
      body: {
        route: route.path,
        action,
        entityId,
      },
    }).catch(() => {
      // non-critical
    })
  }

  function stopPresence() {
    if (presenceTimer) {
      clearInterval(presenceTimer)
      presenceTimer = null
    }
  }

  // computed helpers
  function getUsersOnRoute(path: string): PresenceInfo[] {
    return presence.value.filter(
      p => p.route === path && p.userId !== auth.user?.id,
    )
  }

  function getUsersEditingEntity(entityId: string): PresenceInfo[] {
    return presence.value.filter(
      p => p.entityId === entityId && p.action === 'editing' && p.userId !== auth.user?.id,
    )
  }

  onMounted(() => {
    activeConsumers++

    if (activeConsumers === 1) {
      connect()
      startPresence()

      stopAuthWatch = watch(() => auth.isAuthenticated, (authenticated) => {
        if (authenticated) {
          connect()
          startPresence()
        } else {
          disconnect()
          stopPresence()
        }
      })

      stopRouteWatch = watch(() => route.path, () => {
        sendPresence()
      })
    }
  })

  onBeforeUnmount(() => {
    activeConsumers = Math.max(activeConsumers - 1, 0)

    if (activeConsumers === 0) {
      stopAuthWatch?.()
      stopAuthWatch = null
      stopRouteWatch?.()
      stopRouteWatch = null
      stopPresence()
      disconnect()
      eventListeners.length = 0
    }
  })

  return {
    connected,
    presence,
    disconnect,
    sendPresence,
    getUsersOnRoute,
    getUsersEditingEntity,
    onEvent,
  }
}
