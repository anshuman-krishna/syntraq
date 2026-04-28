import { beforeEach, describe, expect, it, vi } from 'vitest'
import { replayComparisonService } from '../../server/services/replayComparisonService'
import { replayModel } from '../../server/models/replayModel'

vi.mock('../../server/models/replayModel', () => ({
  replayModel: {
    findSessionById: vi.fn(),
    findEventsBySession: vi.fn(),
  },
}))

describe('replayComparisonService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when either session is missing', () => {
    vi.mocked(replayModel.findSessionById).mockReturnValue(undefined)

    expect(() => replayComparisonService.compare('a', 'b', 'company_1')).toThrow('one or both sessions not found')
  })

  it('computes metrics and winner comparisons across two sessions', () => {
    vi.mocked(replayModel.findSessionById)
      .mockReturnValueOnce({
        id: 'a',
        userName: 'Alex',
        startedAt: new Date('2026-04-28T00:00:00.000Z'),
        endedAt: new Date('2026-04-28T00:01:00.000Z'),
        eventCount: 3,
      } as never)
      .mockReturnValueOnce({
        id: 'b',
        userName: 'Blake',
        startedAt: new Date('2026-04-28T00:00:00.000Z'),
        endedAt: new Date('2026-04-28T00:02:00.000Z'),
        eventCount: 3,
      } as never)
    vi.mocked(replayModel.findEventsBySession)
      .mockReturnValueOnce([
        { type: 'click', route: '/dashboard', timestamp: new Date('2026-04-28T00:00:05.000Z') },
        { type: 'navigation', route: '/roster', timestamp: new Date('2026-04-28T00:00:15.000Z') },
        { type: 'hesitation', route: '/roster', timestamp: new Date('2026-04-28T00:00:25.000Z') },
      ] as never)
      .mockReturnValueOnce([
        { type: 'click', route: '/dashboard', timestamp: new Date('2026-04-28T00:00:30.000Z') },
        { type: 'click', route: '/dashboard', timestamp: new Date('2026-04-28T00:01:15.000Z') },
      ] as never)

    const result = replayComparisonService.compare('a', 'b', 'company_1')

    expect(result.sessionA.duration).toBe(60000)
    expect(result.sessionB.duration).toBe(120000)
    expect(result.differences.find(diff => diff.metric === 'duration')).toMatchObject({
      winner: 'a',
      label: 'session duration',
    })
  })

  it('returns single-session metrics', () => {
    vi.mocked(replayModel.findSessionById).mockReturnValue({
      id: 'session_1',
      userName: 'Alex',
      startedAt: new Date('2026-04-28T00:00:00.000Z'),
      endedAt: new Date('2026-04-28T00:01:00.000Z'),
      eventCount: 2,
    } as never)
    vi.mocked(replayModel.findEventsBySession).mockReturnValue([
      { type: 'page_visit', route: '/dashboard', timestamp: new Date('2026-04-28T00:00:05.000Z') },
      { type: 'click', route: '/dashboard', timestamp: new Date('2026-04-28T00:00:15.000Z') },
    ] as never)

    expect(replayComparisonService.getMetrics('session_1', 'company_1')).toMatchObject({
      sessionId: 'session_1',
      userName: 'Alex',
      eventCount: 2,
      uniqueRoutes: 1,
    })
  })
})
