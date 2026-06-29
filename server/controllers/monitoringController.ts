import type { H3Event } from 'h3'
import { z } from 'zod'
import { errorTrackingService } from '../services/errorTrackingService'
import { readBodyWithSchema } from '../utils/validation'

// unauthenticated on purpose — errors can happen before login. abuse is bounded
// by the global rate limiter and the field caps below.
const clientErrorSchema = z.object({
  scope: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  url: z.string().max(2000).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
})

export const monitoringController = {
  async captureClientError(event: H3Event) {
    const body = await readBodyWithSchema(event, clientErrorSchema)

    errorTrackingService.capture({
      source: 'client',
      scope: body.scope,
      message: body.message,
      stack: body.stack,
      url: body.url,
      requestId: event.context.requestId,
      context: body.context,
    })

    return { ok: true }
  },
}
