import type { Tutorial } from '@shared/types/tutorial'

export const tutorials: Record<string, Tutorial> = {
  dashboard: {
    id: 'dashboard-intro',
    name: 'dashboard overview',
    steps: [
      {
        id: 'nav-sidebar',
        target: '[data-tutorial="sidebar"]',
        title: 'navigation',
        content: 'use the sidebar to navigate between modules. you can collapse it for more space.',
        placement: 'right',
      },
      {
        id: 'stats-overview',
        target: '[data-tutorial="stats"]',
        title: 'operational stats',
        content: 'these cards show your key metrics at a glance — active drivers, dispatches, inspections, and utilization.',
        placement: 'bottom',
      },
    ],
  },
  roster: {
    id: 'roster-intro',
    name: 'roster walkthrough',
    steps: [
      {
        id: 'roster-filters',
        target: '[data-tutorial="roster-filters"]',
        title: 'filter your roster',
        content: 'search by name, filter by role, or narrow by shift status to find exactly who you need.',
        placement: 'bottom',
      },
      {
        id: 'roster-views',
        target: '[data-tutorial="roster-views"]',
        title: 'switch views',
        content: 'toggle between table view for details, timeline for scheduling, or 3d for spatial visualization.',
        placement: 'bottom',
      },
      {
        id: 'roster-edit',
        target: '[data-tutorial="roster-table"]',
        title: 'manage shifts',
        content: 'hover over any row and click the edit icon to modify shift details. in timeline view, drag shifts to reschedule.',
        placement: 'top',
      },
    ],
  },
}

// map routes to tutorial keys
const routeTutorialMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/roster': 'roster',
}

export function useTutorials() {
  const tutorialStore = useTutorialStore()
  const route = useRoute()
  const auth = useAuthStore()
  const suggestionRef = ref<{ show: () => void } | null>(null)
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let checkTimer: ReturnType<typeof setTimeout> | null = null

  function startTutorial(key: string) {
    const tutorial = tutorials[key]
    if (tutorial) {
      tutorialStore.start(tutorial)
    }
  }

  function isTutorialCompleted(key: string): boolean {
    const tutorial = tutorials[key]
    return tutorial ? tutorialStore.isTutorialCompleted(tutorial.id) : false
  }

  function getTutorialForRoute(path: string): string | null {
    return routeTutorialMap[path] ?? null
  }

  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      suggestForCurrentRoute()
    }, 30_000)
  }

  function suggestForCurrentRoute() {
    const key = getTutorialForRoute(route.path)
    if (!key || isTutorialCompleted(key) || tutorialStore.isActive) return
    suggestionRef.value?.show()
  }

  async function checkAdaptiveSuggestion() {
    if (!auth.isAuthenticated) return
    const key = getTutorialForRoute(route.path)
    if (!key || isTutorialCompleted(key) || tutorialStore.isActive) return

    try {
      const data = await $fetch<{ suggest: boolean }>('/api/behavior/suggest-tutorial', {
        params: { route: route.path },
      })
      if (data.suggest) {
        suggestionRef.value?.show()
      }
    } catch {
      // non-critical
    }
  }

  function startTracking() {
    resetIdleTimer()

    if (import.meta.client) {
      const events = ['mousemove', 'keydown', 'click', 'scroll']
      events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))

      // check backend suggestion after 60 seconds on page
      checkTimer = setTimeout(() => {
        checkAdaptiveSuggestion()
      }, 60_000)

      onBeforeUnmount(() => {
        events.forEach(e => window.removeEventListener(e, resetIdleTimer))
        if (idleTimer) clearTimeout(idleTimer)
        if (checkTimer) clearTimeout(checkTimer)
      })
    }
  }

  return {
    startTutorial,
    isTutorialCompleted,
    getTutorialForRoute,
    startTracking,
    suggestionRef,
    tutorials,
  }
}
