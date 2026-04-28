import { beforeEach, describe, expect, it, vi } from 'vitest'
import { performanceScoringService } from '../../server/services/performanceScoringService'
import { replayModel } from '../../server/models/replayModel'

vi.mock('../../server/models/replayModel', () => ({
  replayModel: {
    findSessionById: vi.fn(),
    findEventsBySession: vi.fn(),
  },
}))

describe('performanceScoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a zeroed score for sessions with no events', () => {
    vi.mocked(replayModel.findSessionById).mockReturnValue({ id: 'session_1' } as never)
    vi.mocked(replayModel.findEventsBySession).mockReturnValue([])

    expect(performanceScoringService.score('session_1', 'company_1')).toEqual({
      sessionId: 'session_1',
      overall: 0,
      efficiency: 0,
      engagement: 0,
      navigation: 0,
      breakdown: [],
      suggestions: ['no events recorded in this session'],
    })
  })

  it('scores sessions and emits targeted guidance', () => {
    vi.mocked(replayModel.findSessionById).mockReturnValue({ id: 'session_1' } as never)
    vi.mocked(replayModel.findEventsBySession).mockReturnValue([
      { type: 'hesitation', route: '/dashboard' },
      { type: 'hesitation', route: '/dashboard' },
      { type: 'page_visit', route: '/dashboard' },
      { type: 'navigation', route: '/roster' },
      { type: 'click', route: '/roster' },
    ] as never)

    const score = performanceScoringService.score('session_1', 'company_1')

    expect(score.sessionId).toBe('session_1')
    expect(score.breakdown).toHaveLength(3)
    expect(score.suggestions.length).toBeGreaterThan(0)
    expect(score.overall).toBeGreaterThanOrEqual(0)
    expect(score.overall).toBeLessThanOrEqual(100)
  })
})
