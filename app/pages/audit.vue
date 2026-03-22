<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()

interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string | null
  metadata: string | null
  createdAt: string
}

const logs = ref<AuditLog[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!auth.isAdmin) {
    router.replace('/dashboard')
    return
  }

  try {
    const data = await $fetch<{ logs: AuditLog[] }>('/api/audit')
    logs.value = data.logs
  } catch {
    // handled by empty state
  } finally {
    loading.value = false
  }
})

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const actionColors: Record<string, string> = {
  'auth.register': 'text-mint',
  'auth.login': 'text-sky-pastel',
  'roster.shift.create': 'text-peach',
  'roster.shift.update': 'text-peach',
  'workflow.create': 'text-mint',
  'workflow.update': 'text-sky-pastel',
  'workflow.delete': 'text-red-400',
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">audit log</h1>
      <p class="text-sm text-white/40">track all system activity across your company</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-6 h-6 border-2 border-sky-pastel/30 border-t-sky-pastel rounded-full animate-spin" />
    </div>

    <div v-else-if="logs.length === 0" class="glass-card p-12 text-center">
      <p class="text-white/40 text-sm">no audit logs yet</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="log in logs"
        :key="log.id"
        class="glass-card p-4 flex items-center gap-4"
      >
        <div class="w-2 h-2 rounded-full shrink-0" :class="actionColors[log.action] ? actionColors[log.action].replace('text-', 'bg-') : 'bg-white/20'" />

        <div class="flex-1 min-w-0">
          <p class="text-sm text-white/80">
            <span :class="actionColors[log.action] ?? 'text-white/60'" class="font-medium">
              {{ log.action }}
            </span>
            <span v-if="log.entityId" class="text-white/30 ml-2 text-xs">
              {{ log.entityType }}:{{ log.entityId.slice(0, 8) }}
            </span>
          </p>
          <p class="text-xs text-white/30 mt-0.5">
            user {{ log.userId.slice(0, 8) }}
          </p>
        </div>

        <p class="text-xs text-white/25 shrink-0">
          {{ formatTime(log.createdAt) }}
        </p>
      </div>
    </div>
  </div>
</template>
