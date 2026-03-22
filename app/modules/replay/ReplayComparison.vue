<script setup lang="ts">
interface SessionMetrics {
  sessionId: string
  userName: string
  duration: number
  eventCount: number
  uniqueRoutes: number
  actionCount: number
  hesitationCount: number
  navigationCount: number
  avgTimeBetweenEvents: number
}

interface ComparisonDifference {
  metric: string
  label: string
  valueA: number
  valueB: number
  winner: 'a' | 'b' | 'tie'
  insight: string
}

interface ComparisonResult {
  sessionA: SessionMetrics
  sessionB: SessionMetrics
  differences: ComparisonDifference[]
}

interface Session {
  id: string
  userName: string
  startedAt: string | Date
  endedAt: string | Date | null
  route: string
  eventCount: number
}

const props = defineProps<{
  sessions: Session[]
}>()

const sessionA = ref('')
const sessionB = ref('')
const loading = ref(false)
const result = ref<ComparisonResult | null>(null)

async function compare() {
  if (!sessionA.value || !sessionB.value || sessionA.value === sessionB.value) return

  loading.value = true
  result.value = null

  try {
    const data = await $fetch<{ comparison: ComparisonResult }>(
      `/api/replay/compare?a=${sessionA.value}&b=${sessionB.value}`
    )
    result.value = data.comparison
  } catch {
    // silent fail
  } finally {
    loading.value = false
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

function formatValue(metric: string, value: number): string {
  if (metric === 'duration') return formatDuration(value)
  if (metric === 'avgTimeBetweenEvents') return `${(value / 1000).toFixed(1)}s`
  return String(value)
}

const winnerColors: Record<string, string> = {
  a: 'text-sky-pastel',
  b: 'text-mint',
  tie: 'text-white/40',
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-end gap-3">
      <div class="flex-1">
        <label class="text-[10px] text-white/30 block mb-1">session a</label>
        <select
          v-model="sessionA"
          class="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-glass-border/30 text-xs text-white/60 outline-none"
        >
          <option value="" disabled>select session</option>
          <option v-for="s in sessions" :key="s.id" :value="s.id">
            {{ s.userName }} — {{ s.route }} ({{ s.eventCount }} events)
          </option>
        </select>
      </div>

      <span class="text-white/20 text-xs pb-2">vs</span>

      <div class="flex-1">
        <label class="text-[10px] text-white/30 block mb-1">session b</label>
        <select
          v-model="sessionB"
          class="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-glass-border/30 text-xs text-white/60 outline-none"
        >
          <option value="" disabled>select session</option>
          <option v-for="s in sessions" :key="s.id" :value="s.id">
            {{ s.userName }} — {{ s.route }} ({{ s.eventCount }} events)
          </option>
        </select>
      </div>

      <button
        class="px-4 py-2 rounded-xl text-xs bg-sky-pastel/10 text-sky-pastel hover:bg-sky-pastel/20 transition-colors duration-200 shrink-0"
        :disabled="!sessionA || !sessionB || sessionA === sessionB || loading"
        @click="compare"
      >
        compare
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="w-5 h-5 border-2 border-sky-pastel/20 border-t-sky-pastel/60 rounded-full animate-spin" />
    </div>

    <div v-else-if="result" class="space-y-3">
      <!-- header -->
      <div class="flex items-center justify-between px-2">
        <span class="text-xs font-medium text-sky-pastel/60">{{ result.sessionA.userName }}</span>
        <span class="text-[10px] text-white/20">comparison</span>
        <span class="text-xs font-medium text-mint/60">{{ result.sessionB.userName }}</span>
      </div>

      <!-- metrics -->
      <div class="space-y-2">
        <div
          v-for="diff in result.differences"
          :key="diff.metric"
          class="glass-card p-3"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs text-white/40">{{ diff.label }}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.04]" :class="winnerColors[diff.winner]">
              {{ diff.winner === 'tie' ? 'tie' : diff.winner === 'a' ? result.sessionA.userName : result.sessionB.userName }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span
              class="text-sm font-medium"
              :class="diff.winner === 'a' ? 'text-sky-pastel' : 'text-white/40'"
            >
              {{ formatValue(diff.metric, diff.valueA) }}
            </span>
            <span
              class="text-sm font-medium"
              :class="diff.winner === 'b' ? 'text-mint' : 'text-white/40'"
            >
              {{ formatValue(diff.metric, diff.valueB) }}
            </span>
          </div>

          <p class="text-[10px] text-white/25 mt-1">{{ diff.insight }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
