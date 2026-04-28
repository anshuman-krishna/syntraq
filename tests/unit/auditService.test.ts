import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auditService } from '../../server/services/auditService'
import { auditModel } from '../../server/models/auditModel'

vi.mock('../../server/models/auditModel', () => ({
  auditModel: {
    create: vi.fn(),
    findByCompany: vi.fn(),
  },
}))

vi.mock('../../shared/utils/id', () => ({
  generateId: vi.fn(() => 'audit_1'),
}))

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('serializes metadata and nulls missing entity ids when logging', () => {
    vi.mocked(auditModel.create).mockReturnValue({ id: 'audit_1' } as never)

    auditService.log({
      companyId: 'company_1',
      userId: 'user_1',
      action: 'shift.updated',
      entityType: 'shift',
      metadata: { shiftId: 'shift_1' },
    })

    expect(auditModel.create).toHaveBeenCalledWith(expect.objectContaining({
      id: 'audit_1',
      companyId: 'company_1',
      userId: 'user_1',
      action: 'shift.updated',
      entityType: 'shift',
      entityId: null,
      metadata: JSON.stringify({ shiftId: 'shift_1' }),
    }))
  })

  it('parses metadata and normalizes timestamps when listing company logs', () => {
    vi.mocked(auditModel.findByCompany).mockReturnValue([
      {
        id: 'audit_1',
        companyId: 'company_1',
        userId: 'user_1',
        action: 'workflow.created',
        entityType: 'workflow',
        entityId: 'workflow_1',
        metadata: '{"source":"test"}',
        createdAt: new Date('2026-04-28T00:00:00.000Z'),
      },
    ] as never)

    expect(auditService.getCompanyLogs('company_1', 10)).toEqual([
      {
        id: 'audit_1',
        companyId: 'company_1',
        userId: 'user_1',
        action: 'workflow.created',
        entityType: 'workflow',
        entityId: 'workflow_1',
        metadata: { source: 'test' },
        createdAt: '2026-04-28T00:00:00.000Z',
      },
    ])
  })
})
