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

export function useTutorials() {
  const tutorialStore = useTutorialStore()

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

  return { startTutorial, isTutorialCompleted, tutorials }
}
