import { createHmac, randomBytes } from 'crypto'
import { generateId } from '../../shared/utils/id'
import { webhookModel } from '../models/webhookModel'
import { loggerService } from './loggerService'
import { AppError } from './authService'

const MAX_FAILURE_COUNT = 10
const DELIVERY_TIMEOUT = 5000

export interface WebhookEventPayload {
  event: string
  timestamp: string
  data: Record<string, unknown>
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export const webhookService = {
  create(companyId: string, url: string, eventTypes: string[]) {
    if (!url.trim()) throw new AppError('webhook url is required', 400)
    if (!eventTypes.length) throw new AppError('at least one event type is required', 400)

    // validate url format
    try {
      new URL(url)
    } catch {
      throw new AppError('invalid webhook url', 400)
    }

    const secret = randomBytes(32).toString('hex')

    return webhookModel.create({
      id: generateId(),
      companyId,
      url: url.trim(),
      eventTypes: JSON.stringify(eventTypes),
      secret,
    })
  },

  list(companyId: string) {
    return webhookModel.findAll(companyId).map(w => ({
      id: w.id,
      url: w.url,
      eventTypes: JSON.parse(w.eventTypes) as string[],
      active: w.active,
      failureCount: w.failureCount,
      lastTriggeredAt: w.lastTriggeredAt,
      createdAt: w.createdAt,
    }))
  },

  getById(id: string, companyId: string) {
    const webhook = webhookModel.findById(id, companyId)
    if (!webhook) throw new AppError('webhook not found', 404)
    return {
      ...webhook,
      eventTypes: JSON.parse(webhook.eventTypes) as string[],
    }
  },

  update(id: string, companyId: string, data: { url?: string; eventTypes?: string[]; active?: boolean }) {
    const existing = webhookModel.findById(id, companyId)
    if (!existing) throw new AppError('webhook not found', 404)

    const updates: Record<string, unknown> = {}
    if (data.url !== undefined) {
      try { new URL(data.url) } catch { throw new AppError('invalid webhook url', 400) }
      updates.url = data.url.trim()
    }
    if (data.eventTypes !== undefined) {
      updates.eventTypes = JSON.stringify(data.eventTypes)
    }
    if (data.active !== undefined) {
      updates.active = data.active
    }

    return webhookModel.update(id, companyId, updates)
  },

  remove(id: string, companyId: string) {
    const existing = webhookModel.findById(id, companyId)
    if (!existing) throw new AppError('webhook not found', 404)
    webhookModel.remove(id, companyId)
    return { success: true }
  },

  getLogs(webhookId: string, companyId: string) {
    return webhookModel.findLogs(webhookId, companyId)
  },

  // fire event to all matching webhooks for a company
  async dispatch(companyId: string, eventType: string, data: Record<string, unknown>) {
    const activeWebhooks = webhookModel.findActive(companyId)

    const matching = activeWebhooks.filter(w => {
      const types = JSON.parse(w.eventTypes) as string[]
      return types.includes(eventType) || types.includes('*')
    })

    for (const webhook of matching) {
      // skip webhooks that have failed too many times
      if (webhook.failureCount >= MAX_FAILURE_COUNT) {
        webhookModel.update(webhook.id, companyId, { active: false })
        loggerService.warn('webhook auto-disabled due to excessive failures', {
          webhookId: webhook.id,
          url: webhook.url,
        })
        continue
      }

      // async delivery — don't block the caller
      this.deliver(webhook.id, companyId, webhook.url, webhook.secret, eventType, data)
    }
  },

  async deliver(
    webhookId: string,
    companyId: string,
    url: string,
    secret: string,
    eventType: string,
    data: Record<string, unknown>,
  ) {
    const payload: WebhookEventPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    }

    const body = JSON.stringify(payload)
    const signature = signPayload(body, secret)
    const start = Date.now()

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventType,
        },
        body,
        signal: AbortSignal.timeout(DELIVERY_TIMEOUT),
      })

      const responseTime = Date.now() - start

      webhookModel.createLog({
        id: generateId(),
        webhookId,
        companyId,
        eventType,
        status: response.status,
        responseTime,
      })

      if (response.ok) {
        webhookModel.resetFailure(webhookId)
      } else {
        webhookModel.incrementFailure(webhookId)
        loggerService.warn('webhook delivery failed', {
          webhookId,
          status: response.status,
          url,
        })
      }
    } catch (error) {
      const responseTime = Date.now() - start
      const message = error instanceof Error ? error.message : 'unknown error'

      webhookModel.createLog({
        id: generateId(),
        webhookId,
        companyId,
        eventType,
        status: 0,
        responseTime,
        error: message,
      })

      webhookModel.incrementFailure(webhookId)
      loggerService.error('webhook delivery error', { webhookId, url, error: message })
    }
  },
}
