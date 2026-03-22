<script setup lang="ts">
const props = defineProps<{
  tutorialKey: string
}>()

const { startTutorial, isTutorialCompleted } = useTutorials()
const visible = ref(false)
const dismissed = ref(false)

const shouldShow = computed(() =>
  visible.value && !dismissed.value && !isTutorialCompleted(props.tutorialKey),
)

function accept() {
  visible.value = false
  startTutorial(props.tutorialKey)
}

function dismiss() {
  dismissed.value = true
  visible.value = false
}

defineExpose({ show: () => { visible.value = true } })
</script>

<template>
  <Transition name="suggestion">
    <div
      v-if="shouldShow"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-glass-border/60 bg-[#0d1225]/80 backdrop-blur-xl shadow-lg shadow-black/20"
    >
      <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-pastel/10 to-mint/10 flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 text-sky-pastel/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <span class="text-sm text-white/50">need help with this?</span>
      <button
        class="text-xs text-sky-pastel/70 hover:text-sky-pastel transition-colors font-medium"
        @click="accept"
      >
        start guide
      </button>
      <button
        class="text-xs text-white/20 hover:text-white/40 transition-colors"
        @click="dismiss"
      >
        dismiss
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.suggestion-enter-active,
.suggestion-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.suggestion-enter-from,
.suggestion-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
