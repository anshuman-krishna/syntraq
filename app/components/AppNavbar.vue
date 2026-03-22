<script setup lang="ts">
const sidebar = useSidebarStore()
const auth = useAuthStore()
const { online, pendingCount } = useOfflineQueue()
const scrolled = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    class="navbar fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-6 transition-all duration-300"
    :class="scrolled && 'navbar-scrolled'"
  >
    <button
      class="lg:hidden mr-4 p-2 rounded-lg hover:bg-glass-hover transition-all duration-200"
      aria-label="toggle sidebar"
      @click="sidebar.toggleMobile()"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <button
      class="hidden lg:flex p-2 rounded-lg hover:bg-glass-hover transition-all duration-200 mr-3"
      aria-label="collapse sidebar"
      @click="sidebar.toggleCollapse()"
    >
      <svg
        class="w-5 h-5 text-white/50 transition-transform duration-300"
        :class="sidebar.collapsed && 'rotate-180'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    </button>

    <NuxtLink to="/dashboard" class="flex items-center gap-2 group">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel to-mint flex items-center justify-center">
        <span class="text-[#0a0e1a] font-bold text-sm">S</span>
      </div>
      <span class="font-semibold text-lg tracking-tight text-white/90 group-hover:text-white transition-all duration-200">
        syntraq
      </span>
    </NuxtLink>

    <div class="flex-1" />

    <div class="flex items-center gap-3">
      <button
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-glass-white/50 border border-glass-border/50 text-xs text-white/30 hover:text-white/50 hover:border-white/15 transition-all duration-200"
        @click="useUiStore().openCommand()"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>search...</span>
        <kbd class="ml-2 px-1 py-0.5 rounded text-[10px] border border-glass-border/50 font-mono">⌘K</kbd>
      </button>

      <Transition name="fade">
        <div
          v-if="!online"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-peach/10 border border-peach/20"
        >
          <div class="w-1.5 h-1.5 rounded-full bg-peach" />
          <span class="text-[10px] text-peach/70">offline</span>
          <span v-if="pendingCount > 0" class="text-[10px] text-peach/50">· {{ pendingCount }} queued</span>
        </div>
      </Transition>

      <button
        class="p-2 rounded-lg hover:bg-glass-hover transition-all duration-200 relative"
        aria-label="notifications"
      >
        <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-peach" />
      </button>

      <div v-if="auth.user" class="flex items-center gap-2">
        <div class="hidden sm:flex flex-col items-end mr-1">
          <span class="text-xs text-white/60 leading-tight">{{ auth.user.name }}</span>
          <span class="text-[10px] text-white/25 leading-tight">{{ auth.user.companyName }}</span>
        </div>
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-pastel/40 to-mint/40 border border-glass-border hover:border-white/20 transition-all duration-200 cursor-pointer flex items-center justify-center">
          <span class="text-[11px] font-medium text-white/70">{{ auth.user.name.charAt(0).toUpperCase() }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.navbar-scrolled {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
</style>
