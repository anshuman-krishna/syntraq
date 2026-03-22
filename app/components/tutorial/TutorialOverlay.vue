<script setup lang="ts">
const tutorial = useTutorialStore()

const tooltipStyle = ref<Record<string, string>>({})
const highlightStyle = ref<Record<string, string>>({})

function positionTooltip() {
  if (!tutorial.currentStep) return

  const el = document.querySelector(tutorial.currentStep.target)
  if (!el) return

  const rect = el.getBoundingClientRect()
  const placement = tutorial.currentStep.placement ?? 'bottom'
  const padding = 12
  const tooltipOffset = 16

  highlightStyle.value = {
    top: `${rect.top - padding}px`,
    left: `${rect.left - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
  }

  switch (placement) {
    case 'bottom':
      tooltipStyle.value = {
        top: `${rect.bottom + tooltipOffset}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)',
      }
      break
    case 'top':
      tooltipStyle.value = {
        bottom: `${window.innerHeight - rect.top + tooltipOffset}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)',
      }
      break
    case 'left':
      tooltipStyle.value = {
        top: `${rect.top + rect.height / 2}px`,
        right: `${window.innerWidth - rect.left + tooltipOffset}px`,
        transform: 'translateY(-50%)',
      }
      break
    case 'right':
      tooltipStyle.value = {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + tooltipOffset}px`,
        transform: 'translateY(-50%)',
      }
      break
  }
}

watch(() => tutorial.currentStep, () => {
  nextTick(positionTooltip)
})

onMounted(() => {
  window.addEventListener('resize', positionTooltip)
  window.addEventListener('scroll', positionTooltip, true)
  positionTooltip()
})

onUnmounted(() => {
  window.removeEventListener('resize', positionTooltip)
  window.removeEventListener('scroll', positionTooltip, true)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="tutorial">
      <div v-if="tutorial.isActive && tutorial.currentStep" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-xs" @click="tutorial.exit()" />

        <div
          class="absolute rounded-2xl border-2 border-sky-pastel/40 transition-all duration-400 ease-out pointer-events-none"
          :style="highlightStyle"
          style="box-shadow: 0 0 0 9999px rgba(0,0,0,0.5), 0 0 20px rgba(167,216,255,0.2);"
        />

        <div
          class="absolute z-10 w-80 animate-scale-in"
          :style="tooltipStyle"
        >
          <div class="tooltip-card p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-white/90">{{ tutorial.currentStep.title }}</h3>
              <span class="text-[10px] text-white/30">
                {{ tutorial.currentStepIndex + 1 }} / {{ tutorial.totalSteps }}
              </span>
            </div>

            <p class="text-xs text-white/50 leading-relaxed">
              {{ tutorial.currentStep.content }}
            </p>

            <div class="flex items-center justify-between pt-1">
              <button
                class="text-xs text-white/30 hover:text-white/50 transition-all duration-200"
                @click="tutorial.exit()"
              >
                skip tutorial
              </button>

              <div class="flex items-center gap-2">
                <UiButton
                  v-if="!tutorial.isFirstStep"
                  variant="ghost"
                  size="sm"
                  @click="tutorial.back()"
                >
                  back
                </UiButton>
                <UiButton
                  variant="primary"
                  size="sm"
                  @click="tutorial.next()"
                >
                  {{ tutorial.isLastStep ? 'finish' : 'next' }}
                </UiButton>
              </div>
            </div>

            <div class="flex items-center justify-center gap-1 pt-1">
              <div
                v-for="i in tutorial.totalSteps"
                :key="i"
                class="w-1.5 h-1.5 rounded-full transition-all duration-200"
                :class="i - 1 === tutorial.currentStepIndex ? 'bg-sky-pastel w-4' : 'bg-white/15'"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tooltip-card {
  background: rgba(15, 20, 35, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(167, 216, 255, 0.05);
}

.tutorial-enter-active,
.tutorial-leave-active {
  transition: opacity 0.3s ease;
}

.tutorial-enter-from,
.tutorial-leave-to {
  opacity: 0;
}
</style>
