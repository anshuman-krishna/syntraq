<script setup lang="ts">
defineProps<{
  error?: string | null
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div v-if="error" class="glass-card p-8 text-center space-y-4 animate-fade-in">
    <div class="w-12 h-12 mx-auto rounded-2xl bg-peach/10 flex items-center justify-center">
      <svg class="w-6 h-6 text-peach/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>

    <div>
      <p class="text-sm text-white/60">something went wrong</p>
      <p class="text-xs text-white/30 mt-1">{{ error }}</p>
    </div>

    <UiButton variant="ghost" size="sm" @click="emit('retry')">
      try again
    </UiButton>
  </div>

  <slot v-else />
</template>
