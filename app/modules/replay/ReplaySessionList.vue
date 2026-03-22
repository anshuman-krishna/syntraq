<script setup lang="ts">
interface Session {
  id: string
  userId: string
  userName: string
  startedAt: string | Date
  endedAt: string | Date | null
  route: string
  eventCount: number
}

defineProps<{
  sessions: Session[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [sessionId: string]
}>()

function formatDate(ts: string | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDuration(start: string | Date, end: string | Date | null): string {
  if (!end) return 'in progress'
  const s = start instanceof Date ? start.getTime() : new Date(start).getTime()
  const e = end instanceof Date ? end.getTime() : new Date(end).getTime()
  const seconds = Math.floor((e - s) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-6 h-6 border-2 border-sky-pastel/30 border-t-sky-pastel rounded-full animate-spin" />
    </div>

    <div v-else-if="sessions.length === 0" class="glass-card p-8 text-center">
      <p class="text-white/40 text-sm">no recorded sessions yet</p>
      <p class="text-white/25 text-xs mt-1">sessions are recorded when users interact with the platform</p>
    </div>

    <button
      v-for="session in sessions"
      :key="session.id"
      class="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all duration-200 text-left"
      @click="emit('select', session.id)"
    >
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel/10 to-mint/10 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-sky-pastel/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm text-white/70 truncate">{{ session.userName }}</p>
        <p class="text-xs text-white/30 mt-0.5">{{ session.route }}</p>
      </div>

      <div class="text-right shrink-0">
        <p class="text-xs text-white/40">{{ formatDate(session.startedAt) }}</p>
        <p class="text-[10px] text-white/25 mt-0.5">
          {{ formatDuration(session.startedAt, session.endedAt) }} · {{ session.eventCount }} events
        </p>
      </div>
    </button>
  </div>
</template>
