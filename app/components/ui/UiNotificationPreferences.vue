<script setup lang="ts">
const ui = useUiStore()

const labels: Record<string, string> = {
  shift: 'shift updates',
  approval: 'approvals',
  escalation: 'escalations',
  message: 'messages',
  comment: 'comments',
  automation: 'automations',
  billing: 'billing',
  system: 'system alerts',
}

const preferences = ref<Record<string, boolean>>({})
const saving = ref(false)

onMounted(async () => {
  try {
    const data = await $fetch<{ preferences: Record<string, boolean> }>('/api/notification-preferences')
    preferences.value = data.preferences
  } catch {
    ui.addToast({ type: 'error', message: 'failed to load notification preferences' })
  }
})

async function toggle(type: string) {
  const next = { ...preferences.value, [type]: !preferences.value[type] }
  preferences.value = next
  saving.value = true
  try {
    const data = await $fetch<{ preferences: Record<string, boolean> }>('/api/notification-preferences', {
      method: 'POST',
      body: { preferences: next },
    })
    preferences.value = data.preferences
  } catch {
    // revert on failure
    preferences.value = { ...next, [type]: !next[type] }
    ui.addToast({ type: 'error', message: 'failed to update preference' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiCard padding="lg">
    <h2 class="text-sm font-semibold text-white/70 mb-1">notifications</h2>
    <p class="text-xs text-white/30 mb-5">choose which updates land in your notification center</p>
    <div class="space-y-2">
      <div
        v-for="(label, type) in labels"
        :key="type"
        class="flex items-center justify-between p-3 rounded-xl bg-glass-white/50"
      >
        <span class="text-sm text-white/70">{{ label }}</span>
        <button
          class="w-10 h-6 rounded-full flex items-center px-1 transition-all"
          :class="preferences[type] ? 'bg-sky-pastel/30 justify-end' : 'bg-white/10 justify-start'"
          :disabled="saving"
          @click="toggle(type)"
        >
          <div class="w-4 h-4 rounded-full transition-all" :class="preferences[type] ? 'bg-sky-pastel' : 'bg-white/40'" />
        </button>
      </div>
    </div>
  </UiCard>
</template>
