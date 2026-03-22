<script setup lang="ts">
const emit = defineEmits<{
  created: []
  cancel: []
}>()

const ui = useUiStore()
const workflowStore = useWorkflowStore()

const name = ref('')
const description = ref('')
const steps = ref([{ name: '', description: '' }])

function addStep() {
  if (steps.value.length >= 20) return
  steps.value.push({ name: '', description: '' })
}

function removeStep(index: number) {
  if (steps.value.length <= 1) return
  steps.value.splice(index, 1)
}

async function handleSubmit() {
  if (!name.value.trim()) return

  const validSteps = steps.value.filter(s => s.name.trim())
  if (validSteps.length === 0) return

  try {
    await workflowStore.create(
      name.value.trim(),
      description.value.trim(),
      validSteps.map(s => ({
        name: s.name.trim(),
        description: s.description.trim() || undefined,
      })),
    )
    ui.addToast({ type: 'success', message: 'workflow created' })
    emit('created')
  } catch {
    ui.addToast({ type: 'error', message: 'failed to create workflow' })
  }
}
</script>

<template>
  <UiCard padding="lg">
    <h2 class="text-sm font-semibold text-white/70 mb-4">create workflow</h2>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <UiInput v-model="name" label="workflow name" />
      <UiInput v-model="description" label="description (optional)" />

      <div>
        <p class="text-xs text-white/40 mb-2">steps</p>
        <div class="space-y-2">
          <div
            v-for="(step, i) in steps"
            :key="i"
            class="flex items-start gap-2"
          >
            <span class="text-[10px] text-white/20 mt-3 w-4 text-right shrink-0">{{ i + 1 }}</span>
            <div class="flex-1 flex gap-2">
              <input
                v-model="step.name"
                type="text"
                :placeholder="`step ${i + 1} name`"
                class="flex-1 bg-glass-white rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 border border-glass-border/30 focus:border-sky-pastel/30 focus:outline-none transition-colors"
              />
              <input
                v-model="step.description"
                type="text"
                placeholder="description"
                class="flex-1 bg-glass-white rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 border border-glass-border/30 focus:border-sky-pastel/30 focus:outline-none transition-colors hidden sm:block"
              />
            </div>
            <button
              type="button"
              class="mt-2 p-1 text-white/15 hover:text-red-400 transition-colors"
              :class="steps.length <= 1 && 'invisible'"
              @click="removeStep(i)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <button
          type="button"
          class="mt-2 text-xs text-sky-pastel/50 hover:text-sky-pastel transition-colors"
          @click="addStep"
        >
          + add step
        </button>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <UiButton type="submit" variant="primary" size="sm" :loading="workflowStore.saving">
          create
        </UiButton>
        <UiButton type="button" variant="ghost" size="sm" @click="emit('cancel')">
          cancel
        </UiButton>
      </div>
    </form>
  </UiCard>
</template>
