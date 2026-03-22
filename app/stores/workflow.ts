import type { Workflow } from '@shared/types/workflow'

export const useWorkflowStore = defineStore('workflow', () => {
  const workflows = ref<Workflow[]>([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchAll() {
    if (loading.value) return
    loading.value = true
    try {
      const data = await $fetch<{ workflows: Workflow[] }>('/api/workflows')
      workflows.value = data.workflows
    } finally {
      loading.value = false
    }
  }

  async function create(name: string, description: string, steps: { name: string; description?: string }[]) {
    saving.value = true
    try {
      const data = await $fetch<{ workflow: Workflow }>('/api/workflows', {
        method: 'POST',
        body: { name, description, steps },
      })
      workflows.value.unshift(data.workflow)
      return data.workflow
    } finally {
      saving.value = false
    }
  }

  async function updateStatus(id: string, status: Workflow['status']) {
    const data = await $fetch<{ workflow: Workflow }>(`/api/workflows/${id}`, {
      method: 'PUT',
      body: { status },
    })
    const idx = workflows.value.findIndex(w => w.id === id)
    if (idx !== -1) workflows.value[idx] = data.workflow
  }

  async function remove(id: string) {
    await $fetch(`/api/workflows/${id}`, { method: 'DELETE' })
    workflows.value = workflows.value.filter(w => w.id !== id)
  }

  return { workflows, loading, saving, fetchAll, create, updateStatus, remove }
})
