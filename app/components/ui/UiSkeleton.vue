<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'line' | 'circle' | 'card' | 'table-row'
  lines?: number
}>(), {
  variant: 'line',
  lines: 1,
})
</script>

<template>
  <div v-if="variant === 'line'" class="space-y-2.5">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton h-3 rounded-full"
      :style="{ width: `${60 + (i % 3) * 15}%` }"
    />
  </div>

  <div v-else-if="variant === 'circle'" class="skeleton w-10 h-10 rounded-full" />

  <div v-else-if="variant === 'card'" class="glass-card p-6 space-y-4">
    <div class="skeleton h-3 w-1/3 rounded-full" />
    <div class="space-y-2">
      <div class="skeleton h-8 w-1/2 rounded-lg" />
      <div class="skeleton h-2.5 w-2/3 rounded-full" />
    </div>
  </div>

  <div v-else-if="variant === 'table-row'" class="flex items-center gap-4 py-3 px-4">
    <div class="skeleton w-8 h-8 rounded-lg shrink-0" />
    <div class="flex-1 space-y-1.5">
      <div class="skeleton h-3 w-1/3 rounded-full" />
      <div class="skeleton h-2 w-1/5 rounded-full" />
    </div>
    <div class="skeleton h-5 w-16 rounded-lg shrink-0" />
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
