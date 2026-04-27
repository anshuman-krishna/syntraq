import type { H3Event } from 'h3'
import { z } from 'zod'
import { billingService } from '../services/billingService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { loggerService as logger } from '../services/loggerService'
import { apiError } from '../utils/errors'
import { readBodyWithSchema } from '../utils/validation'

const createCheckoutSchema = z.object({
  planId: z.string().trim().min(1),
})

export const billingController = {
  async createCheckout(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage billing')

    const body = await readBodyWithSchema(event, createCheckoutSchema)

    const result = await billingService.createCheckoutSession(user.companyId, body.planId)

    auditService.log({
      companyId: user.companyId,
      userId: user.id,
      action: 'billing.checkout_created',
      entityType: 'subscription',
      metadata: { planId: body.planId },
    })

    return result
  },

  async handleWebhook(event: H3Event) {
    const signature = getHeader(event, 'stripe-signature')
    if (!signature) {
      throw apiError('validation_error', 'missing stripe signature', undefined, event)
    }

    const rawBody = await readRawBody(event, false)
    if (!rawBody) {
      throw apiError('validation_error', 'missing request body', undefined, event)
    }

    try {
      const result = await billingService.handleWebhookEvent(
        typeof rawBody === 'string' ? rawBody : new TextDecoder().decode(rawBody),
        signature,
      )
      return result
    } catch (err) {
      logger.error('stripe webhook failed', { error: (err as Error).message })
      throw apiError('validation_error', 'webhook processing failed', undefined, event)
    }
  },
}
