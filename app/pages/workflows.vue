<script setup lang="ts">
const workflowStore = useWorkflowStore()
const auth = useAuthStore()
const ui = useUiStore()
const { getUsersOnRoute } = useRealtime()
const showCreate = ref(false)
const canManage = computed(() => auth.hasMinRole('manager'))
const pageUsers = computed(() => getUsersOnRoute('/workflows'))

onMounted(() => {
  workflowStore.fetchAll()
})

async function handleActivate(id: string) {
  try {
    await workflowStore.updateStatus(id, 'active')
    ui.addToast({ type: 'success', message: 'workflow activated' })
  } catch {
    ui.addToast({ type: 'error', message: 'failed to activate workflow' })
  }
}

async function handleArchive(id: string) {
  try {
    await workflowStore.updateStatus(id, 'archived')
    ui.addToast({ type: 'info', message: 'workflow archived' })
  } catch {
    ui.addToast({ type: 'error', message: 'failed to archive workflow' })
  }
}

async function handleRemove(id: string) {
  try {
    await workflowStore.remove(id)
    ui.addToast({ type: 'info', message: 'workflow deleted' })
  } catch {
    ui.addToast({ type: 'error', message: 'failed to delete workflow' })
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">workflows</h1>
        <p class="text-sm text-white/40">define repeatable operational processes</p>
      </div>
      <UiPresence :users="pageUsers" />

      <UiButton
        v-if="canManage && !showCreate"
        variant="primary"
        size="sm"
        @click="showCreate = true"
      >
        new workflow
      </UiButton>
    </div>

    <WorkflowCreateForm
      v-if="canManage && showCreate"
      @created="showCreate = false"
      @cancel="showCreate = false"
    />

    <WorkflowList
      :workflows="workflowStore.workflows"
      :loading="workflowStore.loading"
      @activate="handleActivate"
      @archive="handleArchive"
      @remove="handleRemove"
    />
  </div>
</template>
