import { createError, type H3Event } from 'h3'

export type ErrorCode =
  | 'validation_error'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'csrf_failed'
  | 'upstream_error'
  | 'internal_error'

export interface ApiErrorShape {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
  requestId?: string
}

const STATUS_FOR: Record<ErrorCode, number> = {
  validation_error: 400,
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  csrf_failed: 403,
  upstream_error: 502,
  internal_error: 500,
}

export function apiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  event?: H3Event,
) {
  const payload: ApiErrorShape = {
    code,
    message,
    ...(details ? { details } : {}),
    ...(event?.context?.requestId ? { requestId: event.context.requestId } : {}),
  }

  return createError({
    statusCode: STATUS_FOR[code],
    message,
    data: { error: payload },
  })
}
