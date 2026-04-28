import { beforeEach, describe, expect, it, vi } from 'vitest'
import { replayService } from '../../server/services/replayService'
import { replayModel } from '../../server/models/replayModel'

vi.mock('../../server/models/replayModel', () => ({
  replayModel: {
    createSession: vi.fn(),
    endSession: vi.fn(),
    createEvents: vi.fn(),
    findSessions: vi.fn(),
    findSessionById: vi.fn(),
    findEventsBySession: vi.fn(),
  },
}))

vi.mock('../../shared/utils/id', () => ({
  generateId: vi
    .fn()
    .mockReturnValueOnce('session_1')
    .mockReturnValueOnce('event_1')
    .mockReturnValueOnce('event_2'),
}))

describe('replayService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates replay sessions with generated ids', () => {
    vi.mocked(replayModel.createSession).mockReturnValue({ id: 'session_1' } as never)

    replayService.startSession('user_1', 'Admin', 'company_1', '/dashboard')

    expect(replayModel.createSession).toHaveBeenCalledWith({
      id: 'session_1',
      companyId: 'company_1',
      userId: 'user_1',
      userName: 'Admin',
      route: '/dashboard',
    })
  })

  it('maps replay events and normalizes nullable fields', () => {
    const events = [
      { type: 'page_visit', route: '/dashboard' },
      { type: 'click', route: '/dashboard', action: 'open-card', metadata: '{"x":1}' },
    ]

    expect(replayService.recordEvents('session_1', 'company_1', events)).toBe(2)
    expect(replayModel.createEvents).toHaveBeenCalledWith([
      {
        id: 'event_1',
        sessionId: 'session_1',
        companyId: 'company_1',
        type: 'page_visit',
        route: '/dashboard',
        action: null,
        metadata: null,
      },
      {
        id: 'event_2',
        sessionId: 'session_1',
        companyId: 'company_1',
        type: 'click',
        route: '/dashboard',
        action: 'open-card',
        metadata: '{"x":1}',
      },
    ])
  })

  it('returns null when the requested session does not exist', () => {
    vi.mocked(replayModel.findSessionById).mockReturnValue(undefined)

    expect(replayService.getSession('session_missing', 'company_1')).toBeNull()
  })
})
