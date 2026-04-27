import type { H3Event } from 'h3'
import { z } from 'zod'
import { planModel } from '../models/planModel'
import { subscriptionModel } from '../models/subscriptionModel'
import { usageService } from '../services/usageService'
import { billingService } from '../services/billingService'
import { auditService } from '../services/auditService'
import { generateId } from '../../shared/utils/id'
import { requireAuth, requirePermission } from '../utils/auth'
import { apiError } from '../utils/errors'
import { readBodyWithSchema } from '../utils/validation'
import { permissionService } from '../services/permissionService'

const changePlanSchema = z.object({
  planId: z.string().trim().min(1),
})

export const planController = {
  getPlans() {
    const plans = planModel.findAll()
    return { plans }
  },

  getUsage(event: H3Event) {
    const user = requireAuth(event)
    const data = usageService.getLimitsAndUsage(user.companyId)
    return data
  },

  async changePlan(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageCompany(user), 'manage subscription')

    const body = await readBodyWithSchema(event, changePlanSchema)

    const plan = planModel.findById(body.planId)
    if (!plan) {
      throw apiError('not_found', 'plan not found', { planId: body.planId }, event)
    }

    // paid plans go through stripe when configured
    if (plan.price > 0 && billingService.isConfigured()) {
      const { url } = await billingService.createCheckoutSession(user.companyId, body.planId)
      return { redirect: url }
    }

    // free plan or stripe not configured — direct switch
    const current = subscriptionModel.findByCompany(user.companyId)
    if (current) {
      subscriptionModel.update(current.id, { status: 'cancelled' })
    }

    const subscription = subscriptionModel.create({
      id: generateId(),
      companyId: user.companyId,
      planId: body.planId,
      status: 'active',
    })

    auditService.log({
      companyId: user.companyId,
      userId: user.id,
      action: 'subscription.changed',
      entityType: 'subscription',
      entityId: subscription.id,
      metadata: { planId: body.planId, planName: plan.name },
    })

    return { subscription, plan }
  },
}
