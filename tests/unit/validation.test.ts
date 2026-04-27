import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { getQuery, readBody } from 'h3'
import { AppError } from '../../server/services/authService'
import { getQueryWithSchema, readBodyWithSchema, rethrowAsApiError } from '../../server/utils/validation'

vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')

  return {
    ...actual,
    getQuery: vi.fn(),
    readBody: vi.fn(),
  }
})

describe('validation utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses request bodies with the provided schema', async () => {
    vi.mocked(readBody).mockResolvedValue({ planId: 'pro' })

    const body = await readBodyWithSchema(
      {} as never,
      z.object({ planId: z.string().trim().min(1) }),
    )

    expect(body).toEqual({ planId: 'pro' })
  })

  it('throws a structured validation error when the body is invalid', async () => {
    vi.mocked(readBody).mockResolvedValue({ planId: '' })

    await expect(
      readBodyWithSchema(
        {} as never,
        z.object({ planId: z.string().trim().min(1, 'plan id required') }),
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      data: {
        error: {
          code: 'validation_error',
          message: 'plan id required',
        },
      },
    })
  })

  it('parses query params with the provided schema', () => {
    vi.mocked(getQuery).mockReturnValue({ mine: 'true' })

    const query = getQueryWithSchema(
      {} as never,
      z.object({ mine: z.enum(['true', 'false']) }),
    )

    expect(query).toEqual({ mine: 'true' })
  })

  it('maps AppError instances into API error envelopes', () => {
    try {
      rethrowAsApiError(new AppError('approval not found', 404), {} as never)
      throw new Error('expected rethrowAsApiError to throw')
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 404,
        data: {
          error: {
            code: 'not_found',
            message: 'approval not found',
          },
        },
      })
    }
  })

  it('rethrows unknown errors unchanged', () => {
    const error = new Error('boom')

    try {
      rethrowAsApiError(error, {} as never)
      throw new Error('expected rethrowAsApiError to throw')
    } catch (caught) {
      expect(caught).toBe(error)
    }
  })
})
