<script setup lang="ts">
const props = withDefaults(defineProps<{
  entity: string
  label?: string
  format?: 'csv' | 'json'
}>(), {
  label: 'export',
  format: 'csv',
})

// session-cookie auth rides along on the browser navigation; download keeps the
// user on the page instead of navigating to the file
const href = computed(() => `/api/export/${props.entity}?format=${props.format}`)
</script>

<template>
  <a
    :href="href"
    download
    class="inline-flex items-center justify-center gap-2 font-medium border backdrop-blur-sm select-none transition-all duration-200 ease-out px-3 py-1.5 text-xs rounded-lg bg-transparent border-transparent text-white/60 hover:text-white hover:bg-glass-white"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </svg>
    {{ label }}
  </a>
</template>
