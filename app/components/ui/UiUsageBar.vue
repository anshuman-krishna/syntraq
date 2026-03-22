<script setup lang="ts">
const props = defineProps<{
  label: string
  current: number
  max: number
}>()

const percentage = computed(() =>
  props.max === 0 ? 0 : Math.min((props.current / props.max) * 100, 100),
)

const isNearLimit = computed(() => percentage.value >= 80)
const isAtLimit = computed(() => props.current >= props.max)
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex justify-between text-xs">
      <span class="text-white/50">{{ label }}</span>
      <span
        class="font-medium"
        :class="{
          'text-white/60': !isNearLimit,
          'text-peach/70': isNearLimit && !isAtLimit,
          'text-red-400/80': isAtLimit,
        }"
      >
        {{ current }} / {{ max === -1 ? '∞' : max }}
      </span>
    </div>
    <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="{
          'bg-gradient-to-r from-sky-pastel/40 to-mint/40': !isNearLimit,
          'bg-gradient-to-r from-peach/40 to-peach/60': isNearLimit && !isAtLimit,
          'bg-gradient-to-r from-red-400/40 to-red-400/60': isAtLimit,
        }"
        :style="{ width: `${max === -1 ? 10 : percentage}%` }"
      />
    </div>
  </div>
</template>
