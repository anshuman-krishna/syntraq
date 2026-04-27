import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../../server/services/authService'
import { approvalController } from '../../server/controllers/approvalController'
import { approvalService } from '../../server/services/approvalService'
import { auditService } from '../../server/services/auditService'
import { realtimeService } from '../../server/services/realtimeService'
import { getQueryWithSchema, readBodyWithSchema } from '../../server/utils/validation'

vi.mock('../../server/services/approvalService', () => ({
  approvalService: {
    getAll: vi.fn(),
    getPending: vi.fn(),
    requestApproval: vi.fn(),
    resolve: vi.fn(),
  },
}))

vi.mock('../../server/services/realtimeService', () => ({
  realtimeService: {
    broadcast: vi.fn(),
  },
}))

vi.mock('../../server/services/auditService', () => ({
  auditService: {
    log: vi.fn(),
  },
}))

vi.mock('../../server/utils/validation', async () => {
  const actual = await vi.importActual<typeof import('../../server/utils/validation')>('../../server/utils/validation')

  return {
    ...actual,
    getQueryWithSchema: vi.fn(),
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

describe('approvalController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only the current user approvals when mine=true', () => {
    const approvals = [{ id: 'approval_1' }]
    vi.mocked(getQueryWithSchema).mockReturnValue({ mine: 'true' })
    vi.mocked(approvalService.getPending).mockReturnValue(approvals as never)

    const result = approvalController.getApprovals(adminEvent)

    expect(approvalService.getPending).toHaveBeenCalledWith('company_1', 'user_1')
    expect(result).toEqual({ approvals })
  })

  it('requests an approval and broadcasts the created entity', async () => {
    const approval = { id: 'approval_2', status: 'pending' }
    vi.mocked(readBodyWithSchema).mockResolvedValue({
      entityType: 'workflow',
      entityId: 'workflow_1',
      assignedTo: 'user_2',
      note: 'review this',
    })
    vi.mocked(approvalService.requestApproval).mockReturnValue(approval as never)

    const result = await approvalController.requestApproval(adminEvent)

    expect(approvalService.requestApproval).toHaveBeenCalledWith({
      entityType: 'workflow',
      entityId: 'workflow_1',
      requestedBy: 'user_1',
      assignedTo: 'user_2',
      companyId: 'company_1',
      note: 'review this',
    })
    expect(realtimeService.broadcast).toHaveBeenCalledWith(expect.objectContaining({
      type: 'approval_created',
      payload: { approval },
      companyId: 'company_1',
    }))
    expect(result).toEqual({ approval })
  })

  it('maps service AppError failures into API errors when resolving', async () => {
    vi.mocked(readBodyWithSchema).mockResolvedValue({
      id: 'approval_missing',
      status: 'approved',
      note: 'approved',
    })
    vi.mocked(approvalService.resolve).mockImplementation(() => {
      throw new AppError('approval not found', 404)
    })

    await expect(approvalController.resolveApproval(adminEvent)).rejects.toMatchObject({
      statusCode: 404,
      data: {
        error: {
          code: 'not_found',
          message: 'approval not found',
        },
      },
    })
    expect(auditService.log).not.toHaveBeenCalled()
    expect(realtimeService.broadcast).not.toHaveBeenCalled()
  })
})
