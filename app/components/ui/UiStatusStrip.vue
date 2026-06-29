<script setup lang="ts">
interface StatusResponse {
  status: string
  uptime: number
  samples: Array<{ timestamp: string; status: string }>
}

const data = ref<StatusResponse | null>(null)

onMounted(async () => {
  try {
    data.value = await $fetch<StatusResponse>('/api/status')
  } catch {
    // strip simply stays hidden if status is unreachable
  }
})

const dotColor = computed(() => {
  if (!data.value) return 'bg-white/20'
  return data.value.status === 'healthy' ? 'bg-mint' : 'bg-peach-glow'
})

const label = computed(() => {
  if (!data.value) return ''
  return data.value.status === 'healthy' ? 'all systems operational' : 'degraded performance'
})
</script>

<template>
  <div v-if="data" class="flex items-center gap-2 text-xs text-white/30">
    <span class="relative flex h-2 w-2">
      <span class="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" :class="dotColor" />
      <span class="relative inline-flex h-2 w-2 rounded-full" :class="dotColor" />
    </span>
    <span>{{ label }}</span>
    <span class="text-white/20">· {{ data.uptime }}% uptime</span>
  </div>
</template>
