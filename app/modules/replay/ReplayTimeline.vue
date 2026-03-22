<script setup lang="ts">
interface ReplayEvent {
  id: string
  type: string
  route: string
  action: string | null
  metadata: string | null
  timestamp: string | Date
}

const props = defineProps<{
  events: ReplayEvent[]
  currentIndex: number
  playing: boolean
}>()

const emit = defineEmits<{
  seek: [index: number]
  play: []
  pause: []
  step: [direction: 'forward' | 'backward']
}>()

const progress = computed(() => {
  if (props.events.length === 0) return 0
  return (props.currentIndex / (props.events.length - 1)) * 100
})

const currentEvent = computed(() => props.events[props.currentIndex])

function formatTimestamp(ts: string | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const typeColors: Record<string, string> = {
  navigation: 'bg-sky-pastel/40',
  page_visit: 'bg-sky-pastel/40',
  action: 'bg-mint/40',
  hesitation: 'bg-peach/40',
  click: 'bg-mint/40',
}

function handleBarClick(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  const idx = Math.round(pct * (props.events.length - 1))
  emit('seek', Math.max(0, Math.min(idx, props.events.length - 1)))
}
</script>

<template>
  <div class="glass-card p-4 space-y-3">
    <!-- scrubber bar -->
    <div
      class="relative h-2 rounded-full bg-white/[0.06] cursor-pointer group"
      @click="handleBarClick"
    >
      <!-- event markers -->
      <div
        v-for="(evt, i) in events"
        :key="evt.id"
        class="absolute top-0 h-full w-0.5 rounded-full transition-opacity duration-150"
        :class="[
          typeColors[evt.type] ?? 'bg-white/20',
          i <= currentIndex ? 'opacity-80' : 'opacity-30',
        ]"
        :style="{ left: `${(i / Math.max(events.length - 1, 1)) * 100}%` }"
      />

      <!-- progress fill -->
      <div
        class="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-sky-pastel/30 to-mint/30 transition-all duration-150"
        :style="{ width: `${progress}%` }"
      />

      <!-- thumb -->
      <div
        class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sky-pastel shadow-lg shadow-sky-pastel/20 transition-all duration-150 group-hover:scale-125"
        :style="{ left: `${progress}%`, marginLeft: '-6px' }"
      />
    </div>

    <!-- controls -->
    <div class="flex items-center gap-3">
      <button
        class="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors duration-150"
        :disabled="currentIndex <= 0"
        :class="currentIndex <= 0 ? 'opacity-30' : 'text-white/60 hover:text-white'"
        @click="emit('step', 'backward')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        class="p-2 rounded-xl bg-sky-pastel/10 hover:bg-sky-pastel/20 text-sky-pastel transition-all duration-200"
        @click="playing ? emit('pause') : emit('play')"
      >
        <svg v-if="!playing" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>

      <button
        class="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors duration-150"
        :disabled="currentIndex >= events.length - 1"
        :class="currentIndex >= events.length - 1 ? 'opacity-30' : 'text-white/60 hover:text-white'"
        @click="emit('step', 'forward')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div class="flex-1" />

      <span class="text-xs text-white/30 font-mono">
        {{ currentIndex + 1 }} / {{ events.length }}
      </span>
    </div>

    <!-- current event detail -->
    <div v-if="currentEvent" class="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
      <div
        class="w-2 h-2 rounded-full shrink-0"
        :class="typeColors[currentEvent.type] ?? 'bg-white/20'"
      />
      <div class="flex-1 min-w-0">
        <p class="text-xs text-white/60 truncate">
          <span class="text-white/40 font-medium">{{ currentEvent.type }}</span>
          <span v-if="currentEvent.action" class="ml-1.5">{{ currentEvent.action }}</span>
        </p>
        <p class="text-[10px] text-white/25 mt-0.5">
          {{ currentEvent.route }}
        </p>
      </div>
      <span class="text-[10px] text-white/20 font-mono shrink-0">
        {{ formatTimestamp(currentEvent.timestamp) }}
      </span>
    </div>
  </div>
</template>
