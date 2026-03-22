<script setup lang="ts">
interface Anomaly {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  entityId?: string
  entityType?: string
  date?: string
}

const anomalies = ref<Anomaly[]>([])
const loading = ref(true)
const showPanel = ref(false)

onMounted(async () => {
  try {
    const data = await $fetch<{ anomalies: Anomaly[] }>('/api/intelligence/anomalies')
    anomalies.value = data.anomalies
  } catch {
    // silent fail
  } finally {
    loading.value = false
  }
})

const highCount = computed(() => anomalies.value.filter(a => a.severity === 'high').length)
const mediumCount = computed(() => anomalies.value.filter(a => a.severity === 'medium').length)

const severityStyles: Record<string, { dot: string; border: string; bg: string }> = {
  high: { dot: 'bg-red-400', border: 'border-red-400/20', bg: 'bg-red-400/5' },
  medium: { dot: 'bg-peach', border: 'border-peach/20', bg: 'bg-peach/5' },
  low: { dot: 'bg-white/30', border: 'border-white/10', bg: 'bg-white/[0.02]' },
}
</script>

<template>
  <div v-if="!loading && anomalies.length > 0" class="relative">
    <button
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200"
      :class="highCount > 0
        ? 'border-red-400/20 bg-red-400/5 hover:bg-red-400/10'
        : 'border-peach/20 bg-peach/5 hover:bg-peach/10'
      "
      @click="showPanel = !showPanel"
    >
      <span
        class="w-1.5 h-1.5 rounded-full animate-pulse"
        :class="highCount > 0 ? 'bg-red-400' : 'bg-peach'"
      />
      <span class="text-xs" :class="highCount > 0 ? 'text-red-400/70' : 'text-peach/70'">
        {{ anomalies.length }} anomal{{ anomalies.length > 1 ? 'ies' : 'y' }}
      </span>
    </button>

    <Transition name="dropdown">
      <div
        v-if="showPanel"
        class="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-glass-border/50 bg-[rgba(10,14,26,0.95)] backdrop-blur-xl shadow-2xl z-50 p-3 space-y-2"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-xs font-semibold text-white/60">detected anomalies</h3>
          <div class="flex items-center gap-2 text-[10px]">
            <span v-if="highCount" class="text-red-400/60">{{ highCount }} critical</span>
            <span v-if="mediumCount" class="text-peach/60">{{ mediumCount }} attention</span>
          </div>
        </div>

        <div
          v-for="anomaly in anomalies"
          :key="anomaly.id"
          class="flex items-start gap-2 p-2.5 rounded-xl border"
          :class="[severityStyles[anomaly.severity]?.border, severityStyles[anomaly.severity]?.bg]"
        >
          <span
            class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
            :class="severityStyles[anomaly.severity]?.dot"
          />
          <div class="min-w-0">
            <p class="text-xs text-white/60 font-medium">{{ anomaly.title }}</p>
            <p class="text-[10px] text-white/30 mt-0.5">{{ anomaly.description }}</p>
          </div>
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
  transform: translateY(-4px);
}
</style>
