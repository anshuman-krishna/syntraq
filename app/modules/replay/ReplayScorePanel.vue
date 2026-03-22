<script setup lang="ts">
interface ScoreBreakdown {
  category: string
  score: number
  weight: number
  description: string
}

interface PerformanceScore {
  sessionId: string
  overall: number
  efficiency: number
  engagement: number
  navigation: number
  breakdown: ScoreBreakdown[]
  suggestions: string[]
}

const props = defineProps<{
  sessionId: string | null
}>()

const score = ref<PerformanceScore | null>(null)
const loading = ref(false)

watch(() => props.sessionId, async (id) => {
  if (!id) {
    score.value = null
    return
  }

  loading.value = true
  try {
    const data = await $fetch<{ score: PerformanceScore }>(`/api/replay/score?session=${id}`)
    score.value = data.score
  } catch {
    score.value = null
  } finally {
    loading.value = false
  }
}, { immediate: true })

function scoreColor(value: number): string {
  if (value >= 80) return 'text-mint'
  if (value >= 60) return 'text-sky-pastel'
  if (value >= 40) return 'text-yellow-400'
  return 'text-peach'
}

function scoreBg(value: number): string {
  if (value >= 80) return 'from-mint/20 to-mint/5'
  if (value >= 60) return 'from-sky-pastel/20 to-sky-pastel/5'
  if (value >= 40) return 'from-yellow-400/20 to-yellow-400/5'
  return 'from-peach/20 to-peach/5'
}

function progressColor(value: number): string {
  if (value >= 80) return 'bg-mint/60'
  if (value >= 60) return 'bg-sky-pastel/60'
  if (value >= 40) return 'bg-yellow-400/60'
  return 'bg-peach/60'
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-6">
    <div class="w-5 h-5 border-2 border-sky-pastel/20 border-t-sky-pastel/60 rounded-full animate-spin" />
  </div>

  <div v-else-if="score" class="glass-card p-4 space-y-4">
    <!-- overall score -->
    <div class="flex items-center gap-4">
      <div
        class="w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center"
        :class="scoreBg(score.overall)"
      >
        <span class="text-2xl font-bold" :class="scoreColor(score.overall)">
          {{ score.overall }}
        </span>
      </div>
      <div>
        <p class="text-sm font-medium text-white/70">performance score</p>
        <p class="text-[10px] text-white/30 mt-0.5">
          based on efficiency, engagement, and navigation
        </p>
      </div>
    </div>

    <!-- breakdown -->
    <div class="space-y-3">
      <div v-for="item in score.breakdown" :key="item.category" class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-xs text-white/50 capitalize">{{ item.category }}</span>
          <span class="text-xs font-medium" :class="scoreColor(item.score)">
            {{ item.score }}
          </span>
        </div>
        <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="progressColor(item.score)"
            :style="{ width: `${item.score}%` }"
          />
        </div>
        <p class="text-[10px] text-white/25">{{ item.description }}</p>
      </div>
    </div>

    <!-- suggestions -->
    <div v-if="score.suggestions.length" class="space-y-1.5 pt-3 border-t border-glass-border/30">
      <p class="text-[10px] font-medium text-white/40 uppercase tracking-wider">suggestions</p>
      <div
        v-for="(suggestion, i) in score.suggestions"
        :key="i"
        class="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]"
      >
        <svg class="w-3 h-3 mt-0.5 text-sky-pastel/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p class="text-[11px] text-white/40 leading-relaxed">{{ suggestion }}</p>
      </div>
    </div>
  </div>
</template>
