import { generateId } from '../../shared/utils/id'
import type { ChatMessage } from '../../shared/types/ai'
import { predictionService } from './predictionService'
import { anomalyService } from './anomalyService'

interface ChatContext {
  route: string
  module?: string
  companyId?: string
}

export interface GeneratedWorkflow {
  name: string
  description: string
  steps: { name: string; description: string }[]
}

// workflow generation templates
const workflowTemplates: Record<string, GeneratedWorkflow> = {
  inspection: {
    name: 'vehicle inspection',
    description: 'standard vehicle inspection checklist',
    steps: [
      { name: 'exterior check', description: 'inspect body, lights, mirrors, and tires' },
      { name: 'fluid levels', description: 'check oil, coolant, brake fluid, and washer fluid' },
      { name: 'safety equipment', description: 'verify fire extinguisher, first aid kit, and reflective triangles' },
      { name: 'cabin check', description: 'test instruments, seatbelts, and horn' },
      { name: 'documentation', description: 'log findings and sign off' },
    ],
  },
  onboarding: {
    name: 'employee onboarding',
    description: 'new hire onboarding process',
    steps: [
      { name: 'documentation review', description: 'collect and verify license, insurance, and certifications' },
      { name: 'safety orientation', description: 'review company safety policies and procedures' },
      { name: 'equipment training', description: 'walkthrough of assigned vehicle and equipment' },
      { name: 'route familiarization', description: 'shadow ride with experienced operator' },
      { name: 'competency assessment', description: 'evaluate readiness for solo operations' },
    ],
  },
  maintenance: {
    name: 'scheduled maintenance',
    description: 'routine vehicle maintenance procedure',
    steps: [
      { name: 'intake', description: 'log vehicle mileage, reported issues, and priority' },
      { name: 'diagnostic scan', description: 'run electronic diagnostics and record codes' },
      { name: 'service items', description: 'complete oil change, filter replacement, and fluid top-off' },
      { name: 'safety inspection', description: 'check brakes, steering, and suspension' },
      { name: 'road test', description: 'verify performance under normal operating conditions' },
      { name: 'sign off', description: 'update maintenance log and return to fleet' },
    ],
  },
  dispatch: {
    name: 'dispatch procedure',
    description: 'standard job dispatch workflow',
    steps: [
      { name: 'job review', description: 'review job requirements, location, and timeline' },
      { name: 'resource assignment', description: 'assign crew and vehicle based on job type' },
      { name: 'pre-departure check', description: 'confirm equipment, fuel, and route plan' },
      { name: 'dispatch notification', description: 'notify crew and confirm eta with client' },
      { name: 'job completion', description: 'collect sign-off and document deliverables' },
    ],
  },
  safety: {
    name: 'safety incident report',
    description: 'incident reporting and follow-up process',
    steps: [
      { name: 'immediate response', description: 'ensure safety of all personnel and secure the scene' },
      { name: 'incident documentation', description: 'record details, photos, and witness statements' },
      { name: 'notification', description: 'notify supervisor and safety officer' },
      { name: 'investigation', description: 'identify root cause and contributing factors' },
      { name: 'corrective action', description: 'implement preventive measures and update procedures' },
    ],
  },
}

function detectWorkflowIntent(message: string): string | null {
  const lower = message.toLowerCase()
  if (!lower.includes('workflow') && !lower.includes('checklist') && !lower.includes('process') && !lower.includes('create')) {
    return null
  }
  for (const key of Object.keys(workflowTemplates)) {
    if (lower.includes(key)) return key
  }
  // generic creation intent
  if (lower.includes('create') || lower.includes('generate') || lower.includes('build')) {
    if (lower.includes('inspect')) return 'inspection'
    if (lower.includes('onboard') || lower.includes('hire')) return 'onboarding'
    if (lower.includes('maintain') || lower.includes('service')) return 'maintenance'
    if (lower.includes('dispatch') || lower.includes('job')) return 'dispatch'
    if (lower.includes('safety') || lower.includes('incident')) return 'safety'
  }
  return null
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

  // check for intelligence queries
  if (context.companyId) {
    if (lower.includes('prediction') || lower.includes('suggest') || lower.includes('recommend')) {
      const predictions = predictionService.getPredictions(context.companyId)
      if (predictions.length > 0) {
        const top = predictions.slice(0, 3)
        return `here are my top suggestions:\n\n${top.map((p, i) => `${i + 1}. **${p.title}** — ${p.description}`).join('\n')}`
      }
      return 'no scheduling predictions available right now. the system needs more historical data to generate suggestions.'
    }

    if (lower.includes('anomal') || lower.includes('issue') || lower.includes('problem') || lower.includes('conflict')) {
      const anomalies = anomalyService.detect(context.companyId)
      if (anomalies.length > 0) {
        const high = anomalies.filter(a => a.severity === 'high')
        const medium = anomalies.filter(a => a.severity === 'medium')
        let response = `detected ${anomalies.length} anomal${anomalies.length > 1 ? 'ies' : 'y'}:`
        if (high.length > 0) {
          response += `\n\n**critical:** ${high.map(a => a.title).join(', ')}`
        }
        if (medium.length > 0) {
          response += `\n\n**attention:** ${medium.map(a => a.title).join(', ')}`
        }
        return response
      }
      return 'no anomalies detected. operations look clean.'
    }
  }

  // check module-specific responses
  const moduleMap = moduleResponses[module]
  if (moduleMap) {
    const keyword = findKeyword(lower, Object.keys(moduleMap).filter(k => k !== 'default'))
    if (keyword) return moduleMap[keyword]!
  }

  // check general keywords
  const generalKeyword = findKeyword(lower, Object.keys(generalResponses))
  if (generalKeyword) return generalResponses[generalKeyword]!

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
  return moduleMap?.default ?? 'i can help with roster management, shift scheduling, fleet tracking, anomaly detection, and workflow generation. what would you like to know?'
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

  // generate a workflow from natural language
  generateWorkflow(message: string): GeneratedWorkflow | null {
    const templateKey = detectWorkflowIntent(message)
    if (!templateKey) return null

    const template = workflowTemplates[templateKey]
    if (!template) return null

    return {
      ...template,
      steps: template.steps.map(s => ({ ...s })),
    }
  },

  // explain a replay event for training mode
  explainEvent(eventType: string, action: string | null, route: string): string {
    const explanations: Record<string, string> = {
      page_visit: `the user navigated to ${route}. this indicates they were looking for information or functionality on this page.`,
      navigation: `the user moved to ${route}. tracking navigation patterns helps identify common workflows and potential ux improvements.`,
      action: action
        ? `the user performed "${action}" on ${route}. this is an active interaction that modified data or state.`
        : `the user took an action on ${route}.`,
      click: action
        ? `the user clicked "${action}". this interaction is part of their workflow on ${route}.`
        : `the user clicked an element on ${route}.`,
      hesitation: `the user paused on ${route}. hesitation events may indicate confusion, decision-making, or areas where the interface could be clearer.`,
    }

    return explanations[eventType] ?? `event type "${eventType}" occurred on ${route}. ${action ? `action: ${action}` : ''}`
  },
}
