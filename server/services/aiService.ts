import { generateId } from '../../shared/utils/id'
import type { ChatMessage } from '../../shared/types/ai'

interface ChatContext {
  route: string
  module?: string
}

const moduleResponses: Record<string, Record<string, string>> = {
  roster: {
    assign: 'to assign a shift, click on an employee row in the roster table, then use the edit panel to set the date, time, and vehicle.',
    shift: 'shifts can be created from the roster page. use the "create shift" action or the command palette (⌘K → "create shift").',
    filter: 'use the filter bar at the top of the roster to narrow by role or shift status. the search box filters by employee name.',
    drag: 'in timeline view, you can drag shifts to reschedule them. the system will update the start and end times automatically.',
    default: 'you\'re viewing the roster manager. here you can manage employee shifts, filter by role or status, and switch between table, timeline, and 3d views.',
  },
  dashboard: {
    stats: 'the dashboard shows real-time stats: active drivers, dispatched shifts, pending inspections, and fleet utilization percentage.',
    activity: 'the activity feed shows recent events — shift creations, updates, completions, and vehicle maintenance entries.',
    fleet: 'fleet status bars show how many vehicles are on-route, available, or in maintenance.',
    default: 'this is your operational overview. it shows key metrics, recent activity, and fleet status at a glance.',
  },
  dispatch: {
    default: 'the dispatch module is where you manage job assignments and track active routes. this module is coming soon.',
  },
  settings: {
    default: 'settings lets you manage your profile information and appearance preferences.',
  },
  maintenance: {
    default: 'the maintenance module tracks vehicle inspections, scheduled services, and repair history. coming soon.',
  },
  billing: {
    default: 'billing handles invoicing, payment tracking, and financial reporting. coming soon.',
  },
}

const generalResponses: Record<string, string> = {
  help: 'i can help you navigate syntraq. try asking about the current page, how to perform actions, or what features are available.',
  navigation: 'use the sidebar to navigate between modules, or press ⌘K to open the command palette for quick access.',
  shortcut: 'keyboard shortcuts: ⌘K opens the command palette, esc closes modals and panels.',
  tutorial: 'tutorials are available on most pages. look for the help icon (?) in the top-right corner, or ask me to start one.',
  workflow: 'workflows let you define repeatable processes like pre-trip inspections. check the workflow module to create or manage them.',
}

function detectModule(route: string): string {
  const path = route.replace(/^\//, '')
  if (!path || path === 'login') return 'general'
  return path.split('/')[0] ?? 'general'
}

function findKeyword(message: string, keywords: string[]): string | null {
  const lower = message.toLowerCase()
  return keywords.find(k => lower.includes(k)) ?? null
}

function generateResponse(message: string, context: ChatContext): string {
  const module = context.module ?? detectModule(context.route)
  const lower = message.toLowerCase()

  // check module-specific responses
  const moduleMap = moduleResponses[module]
  if (moduleMap) {
    const keyword = findKeyword(lower, Object.keys(moduleMap).filter(k => k !== 'default'))
    if (keyword) return moduleMap[keyword]
  }

  // check general keywords
  const generalKeyword = findKeyword(lower, Object.keys(generalResponses))
  if (generalKeyword) return generalResponses[generalKeyword]

  // greeting
  if (/^(hi|hello|hey|sup)\b/.test(lower)) {
    return `hey! i'm the syntraq assistant. ${moduleMap?.default ?? 'how can i help you today?'}`
  }

  // what is this / where am i
  if (lower.includes('what is this') || lower.includes('where am i') || lower.includes('this page')) {
    return moduleMap?.default ?? 'you\'re using syntraq — an operations platform for trucking and field-service companies.'
  }

  // how do i
  if (lower.includes('how do i') || lower.includes('how to')) {
    if (moduleMap?.default) {
      return `${moduleMap.default} what specifically would you like to do?`
    }
    return 'could you be more specific? i can help with roster management, shifts, dispatch, and more.'
  }

  // fallback
  return moduleMap?.default ?? 'i can help with roster management, shift scheduling, fleet tracking, and navigation. what would you like to know?'
}

export const aiService = {
  processMessage(message: string, context: ChatContext): ChatMessage {
    const content = generateResponse(message, context)
    return {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
    }
  },
}
