<script setup lang="ts">
const route = useRoute()
const mobileOpen = ref(false)

const links = [
  { label: 'features', path: '/features' },
  { label: 'pricing', path: '/pricing' },
  { label: 'about', path: '/about' },
]

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass-navbar">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel to-mint flex items-center justify-center">
          <span class="text-[#0a0e1a] font-bold text-sm">S</span>
        </div>
        <span class="font-semibold text-lg tracking-tight text-white/90">syntraq</span>
      </NuxtLink>

      <div class="hidden md:flex items-center gap-8 text-sm">
        <NuxtLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="transition-base"
          :class="isActive(link.path) ? 'text-white' : 'text-white/50 hover:text-white'"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <div class="hidden md:flex items-center gap-3">
        <NuxtLink to="/login">
          <UiButton variant="ghost" size="sm">sign in</UiButton>
        </NuxtLink>
        <NuxtLink to="/register">
          <UiButton variant="primary" size="sm">get started</UiButton>
        </NuxtLink>
      </div>

      <!-- mobile toggle -->
      <button class="md:hidden text-white/60 hover:text-white transition-base" @click="mobileOpen = !mobileOpen">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- mobile menu -->
    <Transition name="slide-down">
      <div v-if="mobileOpen" class="md:hidden glass-panel border-t border-glass-border px-6 py-4 space-y-3">
        <NuxtLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="block text-sm py-2 transition-base"
          :class="isActive(link.path) ? 'text-white' : 'text-white/50'"
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
        <div class="flex gap-3 pt-2">
          <NuxtLink to="/login" @click="mobileOpen = false">
            <UiButton variant="ghost" size="sm">sign in</UiButton>
          </NuxtLink>
          <NuxtLink to="/register" @click="mobileOpen = false">
            <UiButton variant="primary" size="sm">get started</UiButton>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
