import type { Tutorial, TutorialStep } from '@shared/types/tutorial'

export const useTutorialStore = defineStore('tutorial', () => {
  const activeTutorial = ref<Tutorial | null>(null)
  const currentStepIndex = ref(0)
  const isActive = ref(false)
  const completedTutorials = useLocalStorage<string[]>('syntraq:completed-tutorials', [])

  const currentStep = computed<TutorialStep | null>(() => {
    if (!activeTutorial.value || !isActive.value) return null
    return activeTutorial.value.steps[currentStepIndex.value] ?? null
  })

  const totalSteps = computed(() => activeTutorial.value?.steps.length ?? 0)
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep = computed(() => currentStepIndex.value >= totalSteps.value - 1)

  function isTutorialCompleted(tutorialId: string): boolean {
    return completedTutorials.value.includes(tutorialId)
  }

  function start(tutorial: Tutorial) {
    activeTutorial.value = tutorial
    currentStepIndex.value = 0
    isActive.value = true
  }

  function next() {
    if (!isLastStep.value) {
      currentStepIndex.value++
    } else {
      complete()
    }
  }

  function back() {
    if (!isFirstStep.value) {
      currentStepIndex.value--
    }
  }

  function complete() {
    if (activeTutorial.value && !completedTutorials.value.includes(activeTutorial.value.id)) {
      completedTutorials.value = [...completedTutorials.value, activeTutorial.value.id]
    }
    exit()
  }

  function exit() {
    isActive.value = false
    activeTutorial.value = null
    currentStepIndex.value = 0
  }

  function resetProgress(tutorialId: string) {
    completedTutorials.value = completedTutorials.value.filter(id => id !== tutorialId)
  }

  return {
    activeTutorial,
    currentStepIndex,
    isActive,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    completedTutorials,
    isTutorialCompleted,
    start,
    next,
    back,
    complete,
    exit,
    resetProgress,
  }
})
