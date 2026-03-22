<script setup lang="ts">
interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

const open = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)

async function fetchNotifications() {
  loading.value = true
  try {
    const data = await $fetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')
    notifications.value = data.notifications
    unreadCount.value = data.unreadCount
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
}

async function markRead(id: string) {
  try {
    await $fetch('/api/notifications/read', { method: 'POST', body: { id } })
    const n = notifications.value.find(n => n.id === id)
    if (n) {
      n.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch {
    // silently fail
  }
}

async function markAllRead() {
  try {
    await $fetch('/api/notifications/read-all', { method: 'POST' })
    notifications.value.forEach(n => { n.read = true })
    unreadCount.value = 0
  } catch {
    // silently fail
  }
}

function toggle() {
  open.value = !open.value
  if (open.value && notifications.value.length === 0) {
    fetchNotifications()
  }
}

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// close on click outside
function handleClickOutside(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest('.notification-center')
  if (!el) open.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchNotifications()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const typeIcons: Record<string, string> = {
  welcome: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  shift: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  system: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  limit: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
}
</script>

<template>
  <div class="notification-center relative">
    <button
      class="p-2 rounded-lg hover:bg-glass-hover transition-all duration-200 relative"
      aria-label="notifications"
      @click.stop="toggle"
    >
      <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-peach text-[9px] font-bold text-[#0a0e1a] flex items-center justify-center px-0.5"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0e1225]/95 backdrop-blur-xl shadow-2xl shadow-black/30 z-50"
      >
        <div class="sticky top-0 flex items-center justify-between p-4 border-b border-white/[0.06] bg-[#0e1225]/95 backdrop-blur-xl">
          <h3 class="text-sm font-semibold text-white/70">notifications</h3>
          <button
            v-if="unreadCount > 0"
            class="text-[10px] text-sky-pastel/60 hover:text-sky-pastel transition-colors duration-200"
            @click="markAllRead"
          >
            mark all read
          </button>
        </div>

        <div v-if="loading" class="p-6 flex items-center justify-center">
          <div class="w-5 h-5 border-2 border-sky-pastel/30 border-t-sky-pastel rounded-full animate-spin" />
        </div>

        <div v-else-if="notifications.length === 0" class="p-8 text-center">
          <p class="text-xs text-white/30">no notifications yet</p>
        </div>

        <div v-else class="p-2 space-y-0.5">
          <button
            v-for="n in notifications"
            :key="n.id"
            class="w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-150 text-left"
            :class="n.read ? 'hover:bg-white/[0.02]' : 'bg-sky-pastel/[0.03] hover:bg-sky-pastel/[0.06]'"
            @click="markRead(n.id)"
          >
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-pastel/10 to-mint/10 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="typeIcons[n.type] ?? typeIcons.system" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium" :class="n.read ? 'text-white/40' : 'text-white/70'">{{ n.title }}</p>
              <p class="text-[11px] text-white/30 mt-0.5 line-clamp-2">{{ n.message }}</p>
              <p class="text-[10px] text-white/20 mt-1">{{ formatTime(n.createdAt) }}</p>
            </div>
            <div v-if="!n.read" class="w-1.5 h-1.5 rounded-full bg-sky-pastel/50 shrink-0 mt-2" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
