<script setup lang="ts">
interface GeneratedStep {
  name: string
  description: string
}

interface GeneratedWorkflow {
  name: string
  description: string
  steps: GeneratedStep[]
}

const emit = defineEmits<{
  created: [workflow: GeneratedWorkflow]
}>()

const prompt = ref('')
const loading = ref(false)
const result = ref<GeneratedWorkflow | null>(null)
const error = ref('')

async function generate() {
  if (!prompt.value.trim() || loading.value) return

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const data = await $fetch<{ generated: boolean; workflow?: GeneratedWorkflow; message?: string }>('/api/intelligence/generate-workflow', {
      method: 'POST',
      body: { prompt: prompt.value },
    })

    if (data.generated && data.workflow) {
      result.value = data.workflow
    } else {
      error.value = data.message ?? 'could not generate workflow'
    }
  } catch {
    error.value = 'failed to generate workflow'
  } finally {
    loading.value = false
  }
}

function useWorkflow() {
  if (result.value) {
    emit('created', result.value)
    result.value = null
    prompt.value = ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <input
        v-model="prompt"
        type="text"
        placeholder="describe a workflow... e.g. 'create inspection checklist'"
        class="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-glass-border/50 text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-sky-pastel/30 transition-colors duration-200"
        @keydown.enter="generate"
      >
      <button
        class="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
        :class="loading
          ? 'bg-sky-pastel/5 text-sky-pastel/30'
          : 'bg-sky-pastel/10 text-sky-pastel hover:bg-sky-pastel/20'
        "
        :disabled="loading || !prompt.trim()"
        @click="generate"
      >
        <span v-if="loading" class="flex items-center gap-1.5">
          <span class="w-3 h-3 border-2 border-sky-pastel/20 border-t-sky-pastel/60 rounded-full animate-spin" />
          generating
        </span>
        <span v-else>generate</span>
      </button>
    </div>

    <p v-if="error" class="text-xs text-peach/60">{{ error }}</p>

    <div v-if="result" class="space-y-3">
      <div class="p-4 rounded-2xl border border-mint/15 bg-mint/[0.03]">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h4 class="text-sm font-semibold text-white/70">{{ result.name }}</h4>
            <p class="text-[11px] text-white/35 mt-0.5">{{ result.description }}</p>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded-full bg-mint/10 text-mint/50">ai generated</span>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="(step, i) in result.steps"
            :key="i"
            class="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02]"
          >
            <span class="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-white/30 shrink-0 mt-0.5">
              {{ i + 1 }}
            </span>
            <div>
              <p class="text-xs text-white/60 font-medium">{{ step.name }}</p>
              <p class="text-[10px] text-white/30 mt-0.5">{{ step.description }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <button
            class="flex-1 px-3 py-2 rounded-xl text-xs bg-mint/10 text-mint hover:bg-mint/20 transition-colors duration-200"
            @click="useWorkflow"
          >
            use this workflow
          </button>
          <button
            class="px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-colors duration-200"
            @click="result = null"
          >
            discard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
