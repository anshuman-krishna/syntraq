<script setup lang="ts">
withDefaults(defineProps<{
  hoverable?: boolean
  padding?: 'sm' | 'md' | 'lg'
}>(), {
  hoverable: false,
  padding: 'md',
})

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}
</script>

<template>
  <div
    class="card-glass"
    :class="[
      paddingClasses[padding],
      hoverable && 'card-hoverable',
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.card-glass {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.08),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-hoverable {
  cursor: pointer;
}

.card-hoverable:hover {
  transform: translateY(-3px) perspective(800px) rotateX(1deg);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 15px rgba(167, 216, 255, 0.06),
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}
</style>
