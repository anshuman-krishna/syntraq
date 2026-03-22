import type { H3Event } from 'h3'
import { billingService } from '../services/billingService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'
import { auditService } from '../services/auditService'
import { loggerService as logger } from '../services/loggerService'

export const billingController = {
  async createCheckout(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage billing')

    const body = await readBody(event)
    if (typeof body?.planId !== 'string') {
      throw createError({ statusCode: 400, message: 'planId is required' })
    }

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
      throw createError({ statusCode: 400, message: 'missing stripe signature' })
    }

    const rawBody = await readRawBody(event, false)
    if (!rawBody) {
      throw createError({ statusCode: 400, message: 'missing request body' })
    }

    try {
      const result = await billingService.handleWebhookEvent(
        typeof rawBody === 'string' ? rawBody : new TextDecoder().decode(rawBody),
        signature,
      )
      return result
    } catch (err) {
      logger.error('stripe webhook failed', { error: (err as Error).message })
      throw createError({ statusCode: 400, message: 'webhook processing failed' })
    }
  },
}
