import { beforeEach, describe, expect, it, vi } from 'vitest'
import { planController } from '../../server/controllers/planController'
import { planModel } from '../../server/models/planModel'
import { subscriptionModel } from '../../server/models/subscriptionModel'
import { billingService } from '../../server/services/billingService'
import { auditService } from '../../server/services/auditService'
import { readBodyWithSchema } from '../../server/utils/validation'

vi.mock('../../server/models/planModel', () => ({
  planModel: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}))

vi.mock('../../server/models/subscriptionModel', () => ({
  subscriptionModel: {
    findByCompany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../../server/services/usageService', () => ({
  usageService: {
    getLimitsAndUsage: vi.fn(),
  },
}))

vi.mock('../../server/services/billingService', () => ({
  billingService: {
    createCheckoutSession: vi.fn(),
    isConfigured: vi.fn(),
  },
}))

vi.mock('../../server/services/auditService', () => ({
  auditService: {
    log: vi.fn(),
  },
}))

vi.mock('../../shared/utils/id', () => ({
  generateId: vi.fn(() => 'sub_new'),
}))

vi.mock('../../server/utils/validation', async () => {
  const actual = await vi.importActual<typeof import('../../server/utils/validation')>('../../server/utils/validation')

  return {
    ...actual,
    readBodyWithSchema: vi.fn(),
  }
})

const adminEvent = {
  context: {
    user: {
      id: 'user_1',
      email: 'admin@syntraq.io',
      name: 'Admin',
      role: 'admin',
      companyId: 'company_1',
    },
  },
} as never

describe('planController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a not_found API error when the requested plan does not exist', async () => {
    vi.mocked(readBodyWithSchema).mockResolvedValue({ planId: 'missing' })
    vi.mocked(planModel.findById).mockReturnValue(undefined)

    await expect(planController.changePlan(adminEvent)).rejects.toMatchObject({
      statusCode: 404,
      data: {
        error: {
          code: 'not_found',
          message: 'plan not found',
          details: { planId: 'missing' },
        },
      },
    })
  })

  it('returns a checkout redirect for paid plans when billing is configured', async () => {
    vi.mocked(readBodyWithSchema).mockResolvedValue({ planId: 'pro' })
    vi.mocked(planModel.findById).mockReturnValue({
      id: 'pro',
      name: 'Pro',
      price: 9900,
    } as never)
    vi.mocked(billingService.isConfigured).mockReturnValue(true)
    vi.mocked(billingService.createCheckoutSession).mockResolvedValue({ url: 'https://stripe.test/session' })

    const result = await planController.changePlan(adminEvent)

    expect(billingService.createCheckoutSession).toHaveBeenCalledWith('company_1', 'pro')
    expect(result).toEqual({ redirect: 'https://stripe.test/session' })
    expect(subscriptionModel.create).not.toHaveBeenCalled()
  })

  it('switches directly for free plans and records the audit trail', async () => {
    const existing = { id: 'sub_old' }
    const subscription = { id: 'sub_new', companyId: 'company_1', planId: 'free', status: 'active' }

    vi.mocked(readBodyWithSchema).mockResolvedValue({ planId: 'free' })
    vi.mocked(planModel.findById).mockReturnValue({
      id: 'free',
      name: 'Free',
      price: 0,
    } as never)
    vi.mocked(billingService.isConfigured).mockReturnValue(false)
    vi.mocked(subscriptionModel.findByCompany).mockReturnValue(existing as never)
    vi.mocked(subscriptionModel.create).mockReturnValue(subscription as never)

    const result = await planController.changePlan(adminEvent)

    expect(subscriptionModel.update).toHaveBeenCalledWith('sub_old', { status: 'cancelled' })
    expect(subscriptionModel.create).toHaveBeenCalledWith({
      id: 'sub_new',
      companyId: 'company_1',
      planId: 'free',
      status: 'active',
    })
    expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'subscription.changed',
      companyId: 'company_1',
      userId: 'user_1',
      metadata: { planId: 'free', planName: 'Free' },
    }))
    expect(result).toEqual({
      subscription,
      plan: {
        id: 'free',
        name: 'Free',
        price: 0,
      },
    })
  })
})
