import { replayModel } from '../models/replayModel'
import { AppError } from './authService'

export interface SessionMetrics {
  sessionId: string
  userName: string
  duration: number
  eventCount: number
  uniqueRoutes: number
  actionCount: number
  hesitationCount: number
  navigationCount: number
  avgTimeBetweenEvents: number
}

export interface ComparisonResult {
  sessionA: SessionMetrics
  sessionB: SessionMetrics
  differences: ComparisonDifference[]
}

export interface ComparisonDifference {
  metric: string
  label: string
  valueA: number
  valueB: number
  winner: 'a' | 'b' | 'tie'
  insight: string
}

function computeMetrics(session: { id: string; userName: string; startedAt: Date | number; endedAt: Date | number | null; eventCount: number }, events: { type: string; route: string; timestamp: Date | number }[]): SessionMetrics {
  const start = session.startedAt instanceof Date ? session.startedAt.getTime() : Number(session.startedAt)
  const end = session.endedAt
    ? (session.endedAt instanceof Date ? session.endedAt.getTime() : Number(session.endedAt))
    : start + 60000

  const duration = Math.max(end - start, 1000)
  const uniqueRoutes = new Set(events.map(e => e.route)).size
  const actionCount = events.filter(e => e.type === 'action' || e.type === 'click').length
  const hesitationCount = events.filter(e => e.type === 'hesitation').length
  const navigationCount = events.filter(e => e.type === 'navigation' || e.type === 'page_visit').length

  let avgTimeBetweenEvents = 0
  if (events.length > 1) {
    const timestamps = events.map(e =>
      e.timestamp instanceof Date ? e.timestamp.getTime() : Number(e.timestamp)
    )
    const gaps: number[] = []
    for (let i = 1; i < timestamps.length; i++) {
      gaps.push(timestamps[i]! - timestamps[i - 1]!)
    }
    avgTimeBetweenEvents = gaps.reduce((a, b) => a + b, 0) / gaps.length
  }

  return {
    sessionId: session.id,
    userName: session.userName,
    duration,
    eventCount: events.length,
    uniqueRoutes,
    actionCount,
    hesitationCount,
    navigationCount,
    avgTimeBetweenEvents: Math.round(avgTimeBetweenEvents),
  }
}

function compare(a: SessionMetrics, b: SessionMetrics): ComparisonDifference[] {
  const diffs: ComparisonDifference[] = []

  function addDiff(metric: string, label: string, va: number, vb: number, lowerIsBetter: boolean, insightTemplate: string) {
    const winner = va === vb ? 'tie' : (lowerIsBetter ? (va < vb ? 'a' : 'b') : (va > vb ? 'a' : 'b'))
    diffs.push({
      metric,
      label,
      valueA: va,
      valueB: vb,
      winner,
      insight: insightTemplate.replace('{winner}', winner === 'a' ? a.userName : winner === 'b' ? b.userName : 'both'),
    })
  }

  addDiff('duration', 'session duration', a.duration, b.duration, true,
    '{winner} completed the session faster')
  addDiff('actionCount', 'actions taken', a.actionCount, b.actionCount, false,
    '{winner} performed more actions — may indicate higher engagement')
  addDiff('hesitationCount', 'hesitations', a.hesitationCount, b.hesitationCount, true,
    '{winner} had fewer hesitations — smoother navigation')
  addDiff('uniqueRoutes', 'pages visited', a.uniqueRoutes, b.uniqueRoutes, false,
    '{winner} explored more areas of the platform')
  addDiff('avgTimeBetweenEvents', 'avg time between events', a.avgTimeBetweenEvents, b.avgTimeBetweenEvents, true,
    '{winner} had faster interaction pace')

  return diffs
}

export const replayComparisonService = {
  compare(sessionIdA: string, sessionIdB: string, companyId: string): ComparisonResult {
    const sessionA = replayModel.findSessionById(sessionIdA, companyId)
    const sessionB = replayModel.findSessionById(sessionIdB, companyId)

    if (!sessionA || !sessionB) {
      throw new AppError('one or both sessions not found', 404)
    }

    const eventsA = replayModel.findEventsBySession(sessionIdA, companyId)
    const eventsB = replayModel.findEventsBySession(sessionIdB, companyId)

    const metricsA = computeMetrics(sessionA, eventsA)
    const metricsB = computeMetrics(sessionB, eventsB)

    return {
      sessionA: metricsA,
      sessionB: metricsB,
      differences: compare(metricsA, metricsB),
    }
  },

  getMetrics(sessionId: string, companyId: string): SessionMetrics {
    const session = replayModel.findSessionById(sessionId, companyId)
    if (!session) throw new AppError('session not found', 404)

    const events = replayModel.findEventsBySession(sessionId, companyId)
    return computeMetrics(session, events)
  },
}
