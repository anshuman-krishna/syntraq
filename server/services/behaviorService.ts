import { generateId } from '../../shared/utils/id'
import { behaviorModel } from '../models/behaviorModel'

interface BehaviorEvent {
  type: 'page_visit' | 'action' | 'hesitation'
  route: string
  action?: string
  metadata?: string
  timestamp?: string
}

export const behaviorService = {
  trackBatch(userId: string, companyId: string, events: BehaviorEvent[]) {
    const records = events.map(e => ({
      id: generateId(),
      userId,
      companyId,
      type: e.type,
      route: e.route,
      action: e.action ?? null,
      metadata: e.metadata ?? null,
      createdAt: e.timestamp ? new Date(e.timestamp) : new Date(),
    }))

    return behaviorModel.createBatch(records)
  },

  shouldSuggestTutorial(userId: string, companyId: string, route: string): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentEvents = behaviorModel.findRecentByUserAndRoute(userId, companyId, route, fiveMinutesAgo)

    const visits = recentEvents.filter(e => e.type === 'page_visit')
    const actions = recentEvents.filter(e => e.type === 'action')

    if (visits.length >= 3 && actions.length === 0) return true

    const hesitations = recentEvents.filter(e => e.type === 'hesitation')
    if (hesitations.length >= 2) return true

    return false
  },
}
