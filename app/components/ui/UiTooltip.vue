<script setup lang="ts">
withDefaults(defineProps<{
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>(), {
  position: 'top',
})

const visible = ref(false)

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}
</script>

<template>
  <div
    class="relative inline-block"
    @mouseenter="visible = true"
    @mouseleave="visible = false"
    @focus="visible = true"
    @blur="visible = false"
  >
    <slot />

    <Transition name="tooltip">
      <div
        v-if="visible"
        class="absolute z-50 px-3 py-1.5 text-xs text-white/90 rounded-lg whitespace-nowrap pointer-events-none"
        :class="positionClasses[position]"
        style="background: rgba(20, 24, 40, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08);"
        role="tooltip"
      >
        {{ text }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
