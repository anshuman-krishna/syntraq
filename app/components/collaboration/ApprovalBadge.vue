<script setup lang="ts">
import { reportClientError } from '~/utils/reportClientError'

interface Approval {
  id: string
  entityType: string
  entityId: string
  requestedBy: string
  assignedTo: string
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  createdAt: string | Date
}

const props = defineProps<{
  entityType: string
  entityId: string
}>()

const auth = useAuthStore()
const ui = useUiStore()
const approvals = ref<Approval[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch<{ approvals: Approval[] }>('/api/approvals')
    approvals.value = data.approvals.filter(
      a => a.entityType === props.entityType && a.entityId === props.entityId
    )
  } catch (error) {
    reportClientError('approvals.load', error, { entityType: props.entityType, entityId: props.entityId })
    ui.addToast({ type: 'error', message: 'failed to load approvals' })
  } finally {
    loading.value = false
  }
})

async function resolve(id: string, status: 'approved' | 'rejected') {
  try {
    await $fetch('/api/approvals/resolve', {
      method: 'POST',
      body: { id, status },
    })
    const idx = approvals.value.findIndex(a => a.id === id)
    if (idx >= 0) approvals.value[idx].status = status
  } catch (error) {
    reportClientError('approvals.resolve', error, { entityType: props.entityType, entityId: props.entityId, id, status })
    ui.addToast({ type: 'error', message: 'failed to update approval' })
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400/60 border-yellow-400/20',
  approved: 'bg-mint/10 text-mint/60 border-mint/20',
  rejected: 'bg-red-400/10 text-red-400/60 border-red-400/20',
}
</script>

<template>
  <div v-if="!loading && approvals.length > 0" class="space-y-2">
    <div
      v-for="approval in approvals"
      :key="approval.id"
      class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border"
      :class="statusColors[approval.status]"
    >
      <span class="text-[10px] font-medium capitalize">{{ approval.status }}</span>
      <span v-if="approval.note" class="text-[10px] opacity-70 truncate flex-1">{{ approval.note }}</span>

      <div v-if="approval.status === 'pending' && auth.hasMinRole('manager')" class="flex gap-1 shrink-0">
        <button
          class="p-1 rounded hover:bg-mint/20 text-mint/50 transition-colors duration-150"
          title="approve"
          @click="resolve(approval.id, 'approved')"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          class="p-1 rounded hover:bg-red-400/20 text-red-400/50 transition-colors duration-150"
          title="reject"
          @click="resolve(approval.id, 'rejected')"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
