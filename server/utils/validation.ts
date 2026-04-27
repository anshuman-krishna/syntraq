import { getQuery, readBody, type H3Event } from 'h3'
import type { ZodType } from 'zod'
import { AppError } from '../services/authService'
import { apiError, type ErrorCode } from './errors'

function codeForStatus(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 401:
      return 'unauthenticated'
    case 403:
      return 'forbidden'
    case 404:
      return 'not_found'
    case 409:
      return 'conflict'
    case 429:
      return 'rate_limited'
    default:
      return statusCode >= 500 ? 'internal_error' : 'validation_error'
  }
}

export async function readBodyWithSchema<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw apiError(
      'validation_error',
      parsed.error.issues[0]?.message ?? 'invalid input',
      { issues: parsed.error.issues },
      event,
    )
  }

  return parsed.data
}

export function getQueryWithSchema<T>(event: H3Event, schema: ZodType<T>): T {
  const parsed = schema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw apiError(
      'validation_error',
      parsed.error.issues[0]?.message ?? 'invalid input',
      { issues: parsed.error.issues },
      event,
    )
  }

  return parsed.data
}

export function rethrowAsApiError(error: unknown, event: H3Event): never {
  if (error instanceof AppError) {
    throw apiError(codeForStatus(error.statusCode), error.message, undefined, event)
  }

  throw error
}
