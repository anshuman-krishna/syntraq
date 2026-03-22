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
  event: ReplayEvent | null
  enabled: boolean
}>()

const emit = defineEmits<{
  'update:enabled': [value: boolean]
}>()

const explanation = ref('')
const loading = ref(false)

watch(() => [props.event, props.enabled], async () => {
  if (!props.enabled || !props.event) {
    explanation.value = ''
    return
  }

  loading.value = true
  try {
    const data = await $fetch<{ explanation: string }>(`/api/replay/explain`, {
      params: {
        type: props.event.type,
        action: props.event.action ?? '',
        route: props.event.route,
      },
    })
    explanation.value = data.explanation
  } catch {
    explanation.value = 'unable to generate explanation for this event.'
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-3">
    <!-- toggle -->
    <div class="flex items-center gap-3">
      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200"
        :class="enabled
          ? 'border-purple-400/30 bg-purple-400/10 text-purple-400/80'
          : 'border-glass-border/30 bg-white/[0.02] text-white/30 hover:text-white/50'
        "
        @click="emit('update:enabled', !enabled)"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        training mode
      </button>
      <span v-if="enabled" class="text-[10px] text-purple-400/40">
        step through events with ai explanations
      </span>
    </div>

    <!-- explanation panel -->
    <Transition name="slide-up">
      <div
        v-if="enabled && event"
        class="p-3 rounded-xl border border-purple-400/15 bg-purple-400/[0.03]"
      >
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-3.5 h-3.5 text-purple-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span class="text-[10px] font-medium text-purple-400/60">ai explanation</span>
        </div>

        <div v-if="loading" class="flex items-center gap-2 py-1">
          <div class="w-3 h-3 border-2 border-purple-400/20 border-t-purple-400/60 rounded-full animate-spin" />
          <span class="text-[10px] text-white/25">analyzing event...</span>
        </div>

        <p v-else class="text-xs text-white/50 leading-relaxed">{{ explanation }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
