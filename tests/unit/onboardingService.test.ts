import { beforeEach, describe, expect, it, vi } from 'vitest'
import { onboardingService } from '../../server/services/onboardingService'
import { onboardingModel } from '../../server/models/onboardingModel'

vi.mock('../../server/models/onboardingModel', () => ({
  onboardingModel: {
    findByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../../shared/utils/id', () => ({
  generateId: vi.fn(() => 'onboard_1'),
}))

describe('onboardingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an empty progress payload when nothing is stored', () => {
    vi.mocked(onboardingModel.findByUser).mockReturnValue(undefined)

    expect(onboardingService.getProgress('user_1', 'company_1')).toEqual({
      completedSteps: [],
      completed: false,
    })
  })

  it('creates initial progress when none exists', () => {
    const created = { id: 'onboard_1', completedSteps: '[]', completed: false }
    vi.mocked(onboardingModel.findByUser).mockReturnValueOnce(undefined)
    vi.mocked(onboardingModel.create).mockReturnValue(created as never)

    expect(onboardingService.initProgress('user_1', 'company_1')).toEqual(created)
    expect(onboardingModel.create).toHaveBeenCalledWith(expect.objectContaining({
      id: 'onboard_1',
      userId: 'user_1',
      companyId: 'company_1',
      completedSteps: '[]',
      completed: false,
    }))
  })

  it('marks onboarding complete when the last remaining step is finished', () => {
    vi.mocked(onboardingModel.findByUser).mockReturnValue({
      completedSteps: JSON.stringify([
        'explore_dashboard',
        'view_roster',
        'create_shift',
      ]),
      completed: false,
    } as never)

    expect(onboardingService.completeStep('user_1', 'company_1', 'create_workflow')).toEqual({
      completedSteps: [
        'explore_dashboard',
        'view_roster',
        'create_shift',
        'create_workflow',
      ],
      completed: true,
    })
    expect(onboardingModel.update).toHaveBeenCalledWith(
      'user_1',
      'company_1',
      expect.objectContaining({
        completedSteps: JSON.stringify([
          'explore_dashboard',
          'view_roster',
          'create_shift',
          'create_workflow',
        ]),
        completed: true,
        completedAt: expect.any(Date),
      }),
    )
  })

  it('skips onboarding in a single update', () => {
    expect(onboardingService.skipOnboarding('user_1', 'company_1')).toEqual({
      completedSteps: [],
      completed: true,
    })
    expect(onboardingModel.update).toHaveBeenCalledWith('user_1', 'company_1', {
      completed: true,
      completedAt: expect.any(Date),
    })
  })
})
