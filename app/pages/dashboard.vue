<script setup lang="ts">
import type { ActivityEvent } from '@shared/types/roster'

const roster = useRosterStore()
const { startTutorial } = useTutorials()

const loading = ref(true)
const activityLoading = ref(true)
const activity = ref<ActivityEvent[]>([])

const stats = ref({
  activeDrivers: 0,
  dispatchedToday: 0,
  pendingInspections: 0,
  fleetUtilization: 0,
  onRoute: 0,
  available: 0,
  inMaintenance: 0,
})

const statCards = computed(() => [
  {
    label: 'active drivers',
    value: String(stats.value.activeDrivers),
    change: `+${Math.floor(Math.random() * 4) + 1}`,
  },
  {
    label: 'dispatched today',
    value: String(stats.value.dispatchedToday),
    change: `+${Math.floor(Math.random() * 6) + 2}`,
  },
  {
    label: 'pending inspections',
    value: String(stats.value.pendingInspections),
    change: `-${Math.floor(Math.random() * 3) + 1}`,
  },
  {
    label: 'fleet utilization',
    value: `${stats.value.fleetUtilization}%`,
    change: `+${Math.floor(Math.random() * 5) + 1}%`,
  },
])

const fleetStatus = computed(() => [
  { label: 'on route', count: stats.value.onRoute, total: 8, color: 'from-sky-pastel/60 to-sky-pastel/30' },
  { label: 'available', count: stats.value.available, total: 8, color: 'from-mint/60 to-mint/30' },
  { label: 'maintenance', count: stats.value.inMaintenance, total: 8, color: 'from-peach/60 to-peach/30' },
])

const activityIcons: Record<string, string> = {
  shift_completed: 'M5 13l4 4L19 7',
  shift_updated: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  shift_created: 'M12 4v16m8-8H4',
  employee_added: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  vehicle_maintenance: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37',
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface DashboardResponse {
  stats: typeof stats.value
  activities: ActivityEvent[]
}

onMounted(async () => {
  if (!roster.initialized) roster.fetchAll()

  try {
    const data = await $fetch<DashboardResponse>('/api/dashboard')
    stats.value = data.stats
    activity.value = data.activities
  } catch {
    // fallback to empty state
  } finally {
    loading.value = false
    activityLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">dashboard</h1>
        <p class="text-sm text-white/40">operational overview</p>
      </div>
      <div class="flex items-center gap-2">
        <UiButton variant="ghost" size="sm" @click="startTutorial('dashboard')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </UiButton>
        <kbd class="hidden sm:inline-flex px-2 py-1 rounded-lg text-[10px] text-white/20 border border-glass-border/50 font-mono">
          ⌘K
        </kbd>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tutorial="stats">
      <template v-if="loading">
        <UiSkeleton v-for="i in 4" :key="i" variant="card" />
      </template>
      <template v-else>
        <UiCard
          v-for="stat in statCards"
          :key="stat.label"
          hoverable
          padding="md"
        >
          <p class="text-xs text-white/40 capitalize mb-2">{{ stat.label }}</p>
          <div class="flex items-end justify-between">
            <span class="text-3xl font-bold text-white">{{ stat.value }}</span>
            <span
              class="text-xs font-medium"
              :class="stat.change.startsWith('+') ? 'text-mint' : 'text-peach'"
            >
              {{ stat.change }}
            </span>
          </div>
        </UiCard>
      </template>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <UiCard padding="lg" class="lg:col-span-2">
        <h2 class="text-sm font-semibold text-white/70 mb-4">recent activity</h2>

        <template v-if="activityLoading">
          <div class="space-y-3">
            <UiSkeleton v-for="i in 5" :key="i" variant="table-row" />
          </div>
        </template>

        <template v-else>
          <div class="space-y-2">
            <div
              v-for="event in activity"
              :key="event.id"
              class="flex items-center gap-3 p-3 rounded-xl bg-glass-white/50 hover:bg-glass-white transition-all duration-150"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel/10 to-mint/10 flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="activityIcons[event.type] || activityIcons.shift_updated" />
                </svg>
              </div>
              <p class="text-sm text-white/60 flex-1 min-w-0 truncate">{{ event.description }}</p>
              <span class="text-xs text-white/25 shrink-0">{{ formatTimeAgo(event.timestamp) }}</span>
            </div>
          </div>
        </template>
      </UiCard>

      <UiCard padding="lg">
        <h2 class="text-sm font-semibold text-white/70 mb-4">fleet status</h2>

        <template v-if="loading">
          <div class="space-y-4">
            <UiSkeleton v-for="i in 3" :key="i" variant="line" />
          </div>
        </template>

        <template v-else>
          <div class="space-y-4">
            <div v-for="status in fleetStatus" :key="status.label" class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="text-white/50 capitalize">{{ status.label }}</span>
                <span class="text-white/70">{{ status.count }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-glass-white overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r"
                  :class="status.color"
                  :style="{ width: `${(status.count / status.total) * 100}%` }"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-glass-border/50">
            <div class="flex items-center justify-between text-xs">
              <span class="text-white/40">total vehicles</span>
              <span class="text-white/60">{{ stats.onRoute + stats.available + stats.inMaintenance }}</span>
            </div>
          </div>
        </template>
      </UiCard>
    </div>
  </div>
</template>
