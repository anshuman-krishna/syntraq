<script setup lang="ts">
const sidebar = useSidebarStore()
const route = useRoute()
const { startTracking, suggestionRef, getTutorialForRoute } = useTutorials()
useBehavior()
const { connected } = useRealtime()

onMounted(() => {
  startTracking()
})

const currentTutorialKey = computed(() => getTutorialForRoute(route.path))
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

    <TutorialSuggestion
      v-if="currentTutorialKey"
      :ref="(el: any) => { suggestionRef = el }"
      :tutorial-key="currentTutorialKey"
    />

    <AiChatButton />
    <AiChatPanel />

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
