<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary border-sky-pastel/30 text-white',
  secondary: 'bg-glass-white border-glass-border text-white/80 hover:bg-glass-hover hover:text-white hover:border-white/20',
  ghost: 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-glass-white',
  danger: 'bg-red-500/10 border-red-400/20 text-red-300 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3 text-base rounded-xl',
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center gap-2 font-medium border backdrop-blur-sm select-none transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-sky-pastel/30 focus:ring-offset-2 focus:ring-offset-transparent active:scale-[0.97]"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      { 'opacity-50 pointer-events-none': disabled || loading },
    ]"
    :disabled="disabled || loading"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

<style scoped>
.btn-primary {
  background: linear-gradient(135deg, rgba(167, 216, 255, 0.15), rgba(184, 242, 230, 0.15));
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, rgba(167, 216, 255, 0.25), rgba(184, 242, 230, 0.25));
  box-shadow: 0 0 20px rgba(167, 216, 255, 0.2), 0 0 40px rgba(167, 216, 255, 0.05);
}
</style>
