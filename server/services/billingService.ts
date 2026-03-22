import Stripe from 'stripe'
import { subscriptionModel } from '../models/subscriptionModel'
import { planModel } from '../models/planModel'
import { companyModel } from '../models/companyModel'
import { generateId } from '../../shared/utils/id'
import { AppError } from './authService'

function getStripe(): Stripe | null {
  const config = useRuntimeConfig()
  if (!config.stripeSecretKey) return null
  return new Stripe(config.stripeSecretKey)
}

export const billingService = {
  async createCheckoutSession(companyId: string, planId: string): Promise<{ url: string }> {
    const stripe = getStripe()
    if (!stripe) throw new AppError('billing not configured', 503)

    const plan = planModel.findById(planId)
    if (!plan) throw new AppError('plan not found', 404)
    if (!plan.stripePriceId) throw new AppError('plan has no stripe price configured', 400)
    if (plan.price === 0) throw new AppError('cannot checkout for free plan', 400)

    const company = companyModel.findById(companyId)
    if (!company) throw new AppError('company not found', 404)

    const config = useRuntimeConfig()
    const appUrl = config.public.appUrl

    // check for existing stripe customer
    const currentSub = subscriptionModel.findByCompany(companyId)
    let customerId = currentSub?.stripeCustomerId ?? undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: company.name,
        metadata: { companyId },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel`,
      metadata: { companyId, planId },
      subscription_data: {
        metadata: { companyId, planId },
      },
    })

    if (!session.url) throw new AppError('failed to create checkout session', 500)
    return { url: session.url }
  },

  async handleWebhookEvent(rawBody: string, signature: string) {
    const stripe = getStripe()
    if (!stripe) throw new AppError('billing not configured', 503)

    const config = useRuntimeConfig()
    const event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.syncSubscription(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await this.cancelSubscription(event.data.object as Stripe.Subscription)
        break
    }

    return { received: true }
  },

  async syncSubscription(stripeSub: Stripe.Subscription) {
    const companyId = stripeSub.metadata?.companyId
    const planId = stripeSub.metadata?.planId
    if (!companyId || !planId) return

    const plan = planModel.findById(planId)
    if (!plan) return

    // deactivate current subscription
    const current = subscriptionModel.findByCompany(companyId)
    if (current && current.stripeSubscriptionId !== stripeSub.id) {
      subscriptionModel.update(current.id, { status: 'cancelled' })
    }

    // upsert subscription
    const existing = current?.stripeSubscriptionId === stripeSub.id ? current : null

    const status = stripeSub.status === 'active' || stripeSub.status === 'trialing'
      ? 'active' as const
      : stripeSub.status === 'canceled'
        ? 'cancelled' as const
        : 'expired' as const

    const periodEnd = new Date(stripeSub.current_period_end * 1000)

    if (existing) {
      subscriptionModel.update(existing.id, {
        planId,
        status,
        stripeCustomerId: stripeSub.customer as string,
        stripeSubscriptionId: stripeSub.id,
        currentPeriodEnd: periodEnd,
      })
    } else {
      subscriptionModel.create({
        id: generateId(),
        companyId,
        planId,
        status,
        stripeCustomerId: stripeSub.customer as string,
        stripeSubscriptionId: stripeSub.id,
        currentPeriodEnd: periodEnd,
      })
    }
  },

  async cancelSubscription(stripeSub: Stripe.Subscription) {
    const companyId = stripeSub.metadata?.companyId
    if (!companyId) return

    const current = subscriptionModel.findByCompany(companyId)
    if (current?.stripeSubscriptionId === stripeSub.id) {
      subscriptionModel.update(current.id, { status: 'cancelled' })
    }
  },

  isConfigured(): boolean {
    return !!getStripe()
  },
}
