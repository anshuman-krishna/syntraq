<script setup lang="ts">
interface OnboardingStep {
  id: string
  label: string
}

const router = useRouter()
const ui = useUiStore()

const loading = ref(true)
const steps = ref<OnboardingStep[]>([])
const completedSteps = ref<string[]>([])
const completed = ref(false)
const visible = ref(false)

const progress = computed(() => {
  if (steps.value.length === 0) return 0
  return Math.round((completedSteps.value.length / steps.value.length) * 100)
})

onMounted(async () => {
  try {
    const data = await $fetch<{ steps: OnboardingStep[]; completedSteps: string[]; completed: boolean }>('/api/onboarding')
    steps.value = data.steps
    completedSteps.value = data.completedSteps
    completed.value = data.completed
    visible.value = !data.completed
  } catch {
    // silently skip
  } finally {
    loading.value = false
  }
})

function isStepDone(stepId: string): boolean {
  return completedSteps.value.includes(stepId)
}

const stepRoutes: Record<string, string> = {
  explore_dashboard: '/dashboard',
  view_roster: '/roster',
  create_shift: '/roster',
  create_workflow: '/workflows',
}

async function goToStep(stepId: string) {
  const route = stepRoutes[stepId]
  if (route) router.push(route)

  // mark as complete
  try {
    const data = await $fetch<{ completedSteps: string[]; completed: boolean }>('/api/onboarding/complete', {
      method: 'POST',
      body: { stepId },
    })
    completedSteps.value = data.completedSteps
    if (data.completed) {
      completed.value = true
      visible.value = false
      ui.addToast({ type: 'success', message: 'onboarding complete — welcome to syntraq' })
    }
  } catch {
    // non-critical
  }
}

async function skipOnboarding() {
  try {
    await $fetch('/api/onboarding/skip', { method: 'POST' })
    completed.value = true
    visible.value = false
  } catch {
    visible.value = false
  }
}

function dismiss() {
  visible.value = false
}
</script>

<template>
  <Transition name="onboarding">
    <div
      v-if="visible && !loading"
      class="fixed bottom-20 right-6 z-40 w-80"
    >
      <div class="glass-card p-5 space-y-4 shadow-xl shadow-black/20">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white">getting started</h3>
          <button
            class="p-1 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all duration-200"
            @click="dismiss"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- progress bar -->
        <div class="space-y-1">
          <div class="flex justify-between text-[10px]">
            <span class="text-white/30">progress</span>
            <span class="text-sky-pastel/60">{{ progress }}%</span>
          </div>
          <div class="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-sky-pastel/40 to-mint/40 transition-all duration-500"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- steps -->
        <div class="space-y-1.5">
          <button
            v-for="step in steps"
            :key="step.id"
            class="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 text-left"
            :class="isStepDone(step.id) ? 'bg-mint/[0.04]' : 'hover:bg-white/[0.04]'"
            @click="goToStep(step.id)"
          >
            <div
              class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200"
              :class="isStepDone(step.id) ? 'border-mint/40 bg-mint/10' : 'border-white/[0.12]'"
            >
              <svg
                v-if="isStepDone(step.id)"
                class="w-3 h-3 text-mint/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span
              class="text-xs"
              :class="isStepDone(step.id) ? 'text-white/40 line-through' : 'text-white/60'"
            >
              {{ step.label }}
            </span>
          </button>
        </div>

        <button
          class="w-full text-center text-[10px] text-white/20 hover:text-white/40 transition-colors duration-200"
          @click="skipOnboarding"
        >
          skip onboarding
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.onboarding-enter-active,
.onboarding-leave-active {
  transition: all 0.3s ease;
}

.onboarding-enter-from,
.onboarding-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}
</style>
