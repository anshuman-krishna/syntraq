<script setup lang="ts">
const sidebar = useSidebarStore()
</script>

<template>
  <div class="min-h-screen bg-mesh">
    <AppNavbar />

    <AppSidebar />

    <main
      class="pt-16 min-h-screen transition-all duration-300"
      :class="sidebar.collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'"
    >
      <div class="p-6 lg:p-8 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>

    <Transition name="fade">
      <div
        v-if="sidebar.mobileOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        @click="sidebar.closeMobile()"
      />
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
