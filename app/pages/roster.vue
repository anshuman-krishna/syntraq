<script setup lang="ts">
const roster = useRosterStore()
const auth = useAuthStore()
const { startTutorial } = useTutorials()
const { getUsersOnRoute, sendPresence } = useRealtime()
const canEdit = computed(() => auth.hasMinRole('manager'))
const pageUsers = computed(() => getUsersOnRoute('/roster'))

watch(() => roster.editingShift, (shift) => {
  if (shift) {
    sendPresence('editing', shift.id)
  } else {
    sendPresence('viewing')
  }
})

type ViewMode = 'table' | 'timeline' | '3d'
const activeView = ref<ViewMode>('table')

onMounted(() => {
  if (!roster.initialized) roster.fetchAll()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">roster</h1>
        <p class="text-sm text-white/40">manage employees and shifts</p>
      </div>

      <div class="flex items-center gap-3" data-tutorial="roster-views">
        <div class="flex items-center p-1 rounded-xl bg-glass-white/50 border border-glass-border/50">
          <button
            v-for="view in (['table', 'timeline', '3d'] as ViewMode[])"
            :key="view"
            class="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
            :class="activeView === view ? 'bg-sky-pastel/15 text-sky-pastel' : 'text-white/40 hover:text-white/60'"
            @click="activeView = view"
          >
            {{ view }}
          </button>
        </div>

        <UiPresence :users="pageUsers" />

        <UiButton v-if="canEdit" variant="primary" size="sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          add shift
        </UiButton>

        <UiButton variant="ghost" size="sm" @click="startTutorial('roster')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </UiButton>
      </div>
    </div>

    <IntelligenceSuggestionPanel />

    <div data-tutorial="roster-filters">
      <RosterFilters />
    </div>

    <UiCard padding="sm" data-tutorial="roster-table">
      <template v-if="roster.loading">
        <div class="p-4 space-y-1">
          <UiSkeleton v-for="i in 6" :key="i" variant="table-row" />
        </div>
      </template>

      <template v-else>
        <RosterTable v-if="activeView === 'table'" />
        <RosterTimeline v-else-if="activeView === 'timeline'" />
        <div v-else class="h-[500px] relative">
          <ClientOnly>
            <RosterScene />
          </ClientOnly>
          <div class="absolute bottom-4 left-4 text-xs text-white/30">
            move mouse to explore — shift blocks represent scheduled time
          </div>
        </div>
      </template>
    </UiCard>

    <RosterEditPanel />
  </div>
</template>
