<script setup lang="ts">
interface UsageSummary {
  totalCalls: number
  avgResponseTime: number
  statusCounts: Record<string, number>
  byKey: Array<{ keyId: string; name: string; calls: number }>
  timeSeries: Array<{ hour: string; calls: number }>
  recent: Array<{
    keyName: string
    method: string
    path: string
    statusCode: number
    responseTime: number | null
    createdAt: string
  }>
}

const ui = useUiStore()
const summary = ref<UsageSummary | null>(null)
const hours = ref(24)
const loading = ref(false)

const windowOptions = [
  { label: '24h', value: 24 },
  { label: '7d', value: 168 },
]

onMounted(load)

async function load() {
  loading.value = true
  try {
    const data = await $fetch<{ summary: UsageSummary }>('/api/api-usage', { query: { hours: hours.value } })
    summary.value = data.summary
  } catch {
    ui.addToast({ type: 'error', message: 'failed to load api usage' })
  } finally {
    loading.value = false
  }
}

function setWindow(value: number) {
  if (hours.value === value) return
  hours.value = value
  load()
}

const peakCalls = computed(() => {
  if (!summary.value) return 0
  return Math.max(1, ...summary.value.timeSeries.map(b => b.calls))
})

function barHeight(calls: number) {
  return `${Math.round((calls / peakCalls.value) * 100)}%`
}

function statusColor(status: number) {
  if (status === 0 || status >= 500) return 'text-red-400/70'
  if (status >= 400) return 'text-peach-glow/70'
  return 'text-mint/70'
}

function formatTime(date: string) {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-white/50">requests against the public api</p>
      <div class="flex gap-1 p-1 rounded-lg bg-glass-white/50">
        <button
          v-for="opt in windowOptions"
          :key="opt.value"
          class="px-3 py-1 rounded-md text-xs transition-all"
          :class="hours === opt.value ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/60'"
          @click="setWindow(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <p v-if="loading && !summary" class="text-center text-sm text-white/30 py-8">loading…</p>

    <template v-else-if="summary">
      <!-- stat cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <UiCard padding="md">
          <p class="text-[11px] text-white/30 mb-1">total calls</p>
          <p class="text-xl font-semibold text-white/90">{{ summary.totalCalls }}</p>
        </UiCard>
        <UiCard padding="md">
          <p class="text-[11px] text-white/30 mb-1">avg latency</p>
          <p class="text-xl font-semibold text-white/90">{{ summary.avgResponseTime }}<span class="text-xs text-white/40">ms</span></p>
        </UiCard>
        <UiCard padding="md">
          <p class="text-[11px] text-white/30 mb-1">success</p>
          <p class="text-xl font-semibold text-mint/80">{{ summary.statusCounts['2xx'] ?? 0 }}</p>
        </UiCard>
        <UiCard padding="md">
          <p class="text-[11px] text-white/30 mb-1">errors</p>
          <p class="text-xl font-semibold text-red-400/70">
            {{ (summary.statusCounts['4xx'] ?? 0) + (summary.statusCounts['5xx'] ?? 0) + (summary.statusCounts.error ?? 0) }}
          </p>
        </UiCard>
      </div>

      <!-- time series -->
      <UiCard padding="lg">
        <h3 class="text-sm font-semibold text-white/70 mb-4">calls over time</h3>
        <div v-if="summary.totalCalls" class="flex items-end gap-0.5 h-28">
          <div
            v-for="(bucket, i) in summary.timeSeries"
            :key="i"
            class="flex-1 bg-sky-pastel/30 rounded-t-sm hover:bg-sky-pastel/50 transition-all"
            :style="{ height: barHeight(bucket.calls) }"
            :title="`${bucket.calls} calls`"
          />
        </div>
        <p v-else class="text-center text-sm text-white/30 py-8">no api calls in this window yet</p>
      </UiCard>

      <!-- per key -->
      <UiCard v-if="summary.byKey.length" padding="lg">
        <h3 class="text-sm font-semibold text-white/70 mb-4">by api key</h3>
        <div class="space-y-2">
          <div v-for="key in summary.byKey" :key="key.keyId" class="flex items-center justify-between text-sm">
            <span class="text-white/60">{{ key.name }}</span>
            <span class="text-white/40">{{ key.calls }} call{{ key.calls !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </UiCard>

      <!-- recent -->
      <UiCard v-if="summary.recent.length" padding="lg">
        <h3 class="text-sm font-semibold text-white/70 mb-4">recent calls</h3>
        <div class="space-y-1.5">
          <div
            v-for="(call, i) in summary.recent"
            :key="i"
            class="flex items-center gap-3 text-[11px] py-1.5 border-b border-white/[0.04] last:border-0"
          >
            <span class="text-white/40 w-12 shrink-0 uppercase">{{ call.method }}</span>
            <span class="text-white/60 flex-1 truncate font-mono">{{ call.path }}</span>
            <span :class="statusColor(call.statusCode)">{{ call.statusCode || 'err' }}</span>
            <span class="text-white/30 w-14 text-right">{{ call.responseTime ?? '–' }}ms</span>
            <span class="text-white/20 w-28 text-right shrink-0">{{ formatTime(call.createdAt) }}</span>
          </div>
        </div>
      </UiCard>
    </template>
  </div>
</template>
