import { beforeEach, describe, expect, it, vi } from 'vitest'
import { behaviorService } from '../../server/services/behaviorService'
import { behaviorModel } from '../../server/models/behaviorModel'

vi.mock('../../server/models/behaviorModel', () => ({
  behaviorModel: {
    createBatch: vi.fn(),
    findRecentByUserAndRoute: vi.fn(),
  },
}))

vi.mock('../../shared/utils/id', () => ({
  generateId: vi.fn(() => 'behavior_1'),
}))

describe('behaviorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps tracked events into persisted records', () => {
    vi.mocked(behaviorModel.createBatch).mockReturnValue([{ id: 'behavior_1' }] as never)

    behaviorService.trackBatch('user_1', 'company_1', [
      { type: 'page_visit', route: '/dashboard', timestamp: '2026-04-28T00:00:00.000Z' },
      { type: 'action', route: '/dashboard', action: 'click-card' },
    ])

    expect(behaviorModel.createBatch).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'behavior_1',
        userId: 'user_1',
        companyId: 'company_1',
        type: 'page_visit',
        route: '/dashboard',
        action: null,
        metadata: null,
        createdAt: new Date('2026-04-28T00:00:00.000Z'),
      }),
      expect.objectContaining({
        id: 'behavior_1',
        userId: 'user_1',
        companyId: 'company_1',
        type: 'action',
        route: '/dashboard',
        action: 'click-card',
      }),
    ])
  })

  it('suggests a tutorial after repeated visits without actions', () => {
    vi.mocked(behaviorModel.findRecentByUserAndRoute).mockReturnValue([
      { type: 'page_visit' },
      { type: 'page_visit' },
      { type: 'page_visit' },
    ] as never)

    expect(behaviorService.shouldSuggestTutorial('user_1', 'company_1', '/roster')).toBe(true)
  })

  it('suggests a tutorial when repeated hesitation is detected', () => {
    vi.mocked(behaviorModel.findRecentByUserAndRoute).mockReturnValue([
      { type: 'hesitation' },
      { type: 'hesitation' },
    ] as never)

    expect(behaviorService.shouldSuggestTutorial('user_1', 'company_1', '/workflows')).toBe(true)
  })

  it('does not suggest a tutorial for normal mixed activity', () => {
    vi.mocked(behaviorModel.findRecentByUserAndRoute).mockReturnValue([
      { type: 'page_visit' },
      { type: 'action' },
      { type: 'page_visit' },
    ] as never)

    expect(behaviorService.shouldSuggestTutorial('user_1', 'company_1', '/dashboard')).toBe(false)
  })
})
