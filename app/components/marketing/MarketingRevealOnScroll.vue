<script setup lang="ts">
// fades content up as it scrolls into view. ssr renders the hidden state and the
// client reveals on mount, so there's no hydration mismatch. reduced-motion and
// missing-observer environments show content immediately.
withDefaults(defineProps<{
  as?: string
  delay?: number
}>(), {
  as: 'div',
  delay: 0,
})

const el = ref<HTMLElement | null>(null)
const shown = ref(false)

onMounted(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce || typeof IntersectionObserver === 'undefined') {
    shown.value = true
    return
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        shown.value = true
        io.disconnect()
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

  if (el.value) io.observe(el.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <component
    :is="as"
    ref="el"
    class="reveal"
    :class="{ 'reveal-shown': shown }"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <slot />
  </component>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}
.reveal-shown {
  opacity: 1;
  transform: none;
}
</style>
