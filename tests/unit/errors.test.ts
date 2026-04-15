import { describe, expect, it } from 'vitest'
import { apiError } from '../../server/utils/errors'

describe('apiError', () => {
  it('maps error codes to conventional http status codes', () => {
    expect(apiError('validation_error', 'bad').statusCode).toBe(400)
    expect(apiError('unauthenticated', 'nope').statusCode).toBe(401)
    expect(apiError('forbidden', 'nope').statusCode).toBe(403)
    expect(apiError('not_found', 'gone').statusCode).toBe(404)
    expect(apiError('conflict', 'dup').statusCode).toBe(409)
    expect(apiError('rate_limited', 'slow').statusCode).toBe(429)
    expect(apiError('csrf_failed', 'bad-token').statusCode).toBe(403)
    expect(apiError('upstream_error', 'upstream').statusCode).toBe(502)
    expect(apiError('internal_error', 'boom').statusCode).toBe(500)
  })

  it('embeds the error envelope with code, message, and optional details', () => {
    const err = apiError('validation_error', 'bad', { field: 'email' })
    expect(err.data).toEqual({
      error: {
        code: 'validation_error',
        message: 'bad',
        details: { field: 'email' },
      },
    })
  })

  it('omits details when none are provided', () => {
    const err = apiError('not_found', 'gone')
    expect(err.data).toEqual({
      error: { code: 'not_found', message: 'gone' },
    })
  })
})
