import { replayModel } from '../models/replayModel'
import { AppError } from './authService'

export interface PerformanceScore {
  sessionId: string
  overall: number
  efficiency: number
  engagement: number
  navigation: number
  breakdown: ScoreBreakdown[]
  suggestions: string[]
}

interface ScoreBreakdown {
  category: string
  score: number
  weight: number
  description: string
}

export const performanceScoringService = {
  score(sessionId: string, companyId: string): PerformanceScore {
    const session = replayModel.findSessionById(sessionId, companyId)
    if (!session) throw new AppError('session not found', 404)

    const events = replayModel.findEventsBySession(sessionId, companyId)
    if (events.length === 0) {
      return {
        sessionId,
        overall: 0,
        efficiency: 0,
        engagement: 0,
        navigation: 0,
        breakdown: [],
        suggestions: ['no events recorded in this session'],
      }
    }

    // efficiency: fewer hesitations + faster avg time = better
    const hesitations = events.filter(e => e.type === 'hesitation').length
    const hesitationRatio = events.length > 0 ? hesitations / events.length : 0
    const efficiency = Math.round(Math.max(0, Math.min(100, (1 - hesitationRatio * 3) * 100)))

    // engagement: more actions relative to passive events
    const actions = events.filter(e => e.type === 'action' || e.type === 'click').length
    const actionRatio = events.length > 0 ? actions / events.length : 0
    const engagement = Math.round(Math.min(100, actionRatio * 200))

    // navigation: unique routes explored vs total navigation events
    const uniqueRoutes = new Set(events.map(e => e.route)).size
    const navEvents = events.filter(e => e.type === 'navigation' || e.type === 'page_visit').length
    const navEfficiency = navEvents > 0 ? Math.min(1, uniqueRoutes / navEvents) : 1
    const navigation = Math.round(navEfficiency * 100)

    // weighted overall
    const overall = Math.round(efficiency * 0.4 + engagement * 0.35 + navigation * 0.25)

    const breakdown: ScoreBreakdown[] = [
      {
        category: 'efficiency',
        score: efficiency,
        weight: 0.4,
        description: `${hesitations} hesitation${hesitations !== 1 ? 's' : ''} in ${events.length} events`,
      },
      {
        category: 'engagement',
        score: engagement,
        weight: 0.35,
        description: `${actions} active interaction${actions !== 1 ? 's' : ''} out of ${events.length} events`,
      },
      {
        category: 'navigation',
        score: navigation,
        weight: 0.25,
        description: `${uniqueRoutes} unique route${uniqueRoutes !== 1 ? 's' : ''} with ${navEvents} navigation${navEvents !== 1 ? 's' : ''}`,
      },
    ]

    // generate suggestions
    const suggestions: string[] = []
    if (efficiency < 60) {
      suggestions.push('high hesitation rate detected. consider improving ui clarity or adding tooltips to guide users.')
    }
    if (engagement < 40) {
      suggestions.push('low engagement — the user mostly browsed without interacting. check if call-to-actions are visible enough.')
    }
    if (navigation < 50) {
      suggestions.push('redundant navigation detected. the user visited the same pages multiple times — consider improving information architecture.')
    }
    if (overall >= 80) {
      suggestions.push('excellent session performance. the user navigated efficiently and engaged with key features.')
    }
    if (suggestions.length === 0) {
      suggestions.push('session performance is within normal range. no major issues detected.')
    }

    return {
      sessionId,
      overall,
      efficiency,
      engagement,
      navigation,
      breakdown,
      suggestions,
    }
  },
}
