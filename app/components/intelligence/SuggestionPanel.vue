<script setup lang="ts">
import { reportClientError } from '~/utils/reportClientError'

interface Prediction {
  type: 'optimal_assignment' | 'understaffed' | 'overstaffed' | 'pattern_match'
  confidence: number
  title: string
  description: string
  suggestion?: string
  employeeId?: string
  date?: string
}

const predictions = ref<Prediction[]>([])
const loading = ref(true)
const expanded = ref(true)
const ui = useUiStore()

onMounted(async () => {
  try {
    const data = await $fetch<{ predictions: Prediction[] }>('/api/intelligence/predictions')
    predictions.value = data.predictions
  } catch (error) {
    reportClientError('intelligence.loadPredictions', error)
    ui.addToast({ type: 'error', message: 'failed to load ai suggestions' })
  } finally {
    loading.value = false
  }
})

const typeStyles: Record<string, { icon: string; color: string; bg: string }> = {
  optimal_assignment: {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-mint/70',
    bg: 'from-mint/5 to-transparent',
  },
  understaffed: {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    color: 'text-peach/70',
    bg: 'from-peach/5 to-transparent',
  },
  overstaffed: {
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-sky-pastel/70',
    bg: 'from-sky-pastel/5 to-transparent',
  },
  pattern_match: {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'text-sky-pastel/70',
    bg: 'from-sky-pastel/5 to-transparent',
  },
}
</script>

<template>
  <div v-if="!loading && predictions.length > 0" class="space-y-2">
    <button
      class="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors duration-200"
      @click="expanded = !expanded"
    >
      <svg
        class="w-3 h-3 transition-transform duration-200"
        :class="expanded ? 'rotate-90' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <svg class="w-3.5 h-3.5 text-mint/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      ai suggestions
      <span class="px-1.5 py-0.5 rounded-full bg-mint/10 text-mint/60 text-[10px]">
        {{ predictions.length }}
      </span>
    </button>

    <Transition name="collapse">
      <div v-if="expanded" class="space-y-1.5">
        <div
          v-for="(pred, i) in predictions.slice(0, 5)"
          :key="i"
          class="flex items-start gap-2.5 p-2.5 rounded-xl border border-glass-border/30 bg-gradient-to-r transition-all duration-200 hover:border-glass-border/50"
          :class="typeStyles[pred.type]?.bg"
        >
          <svg class="w-3.5 h-3.5 mt-0.5 shrink-0" :class="typeStyles[pred.type]?.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="typeStyles[pred.type]?.icon" />
          </svg>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-xs font-medium text-white/60 truncate">{{ pred.title }}</p>
              <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30 shrink-0">
                {{ pred.confidence }}%
              </span>
            </div>
            <p class="text-[11px] text-white/35 mt-0.5 line-clamp-2">{{ pred.description }}</p>
            <p v-if="pred.suggestion" class="text-[10px] text-mint/50 mt-1">{{ pred.suggestion }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
