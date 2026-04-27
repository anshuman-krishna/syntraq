import type { H3Event } from 'h3'
import { z } from 'zod'
import { predictionService } from '../services/predictionService'
import { anomalyService } from '../services/anomalyService'
import { aiService } from '../services/aiService'
import { requireAuth, requirePermission } from '../utils/auth'
import { getQueryWithSchema, readBodyWithSchema } from '../utils/validation'
import { permissionService } from '../services/permissionService'

const predictionsQuerySchema = z.object({
  date: z.string().trim().min(1).optional(),
})

const anomaliesQuerySchema = z.object({
  severity: z.string().trim().min(1).optional(),
})

const generateWorkflowSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
})

const explainEventQuerySchema = z.object({
  type: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1).optional(),
})

export const intelligenceController = {
  getPredictions(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view predictions')

    const query = getQueryWithSchema(event, predictionsQuerySchema)
    const predictions = predictionService.getPredictions(user.companyId, query.date)
    return { predictions }
  },

  getAnomalies(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view anomalies')

    const query = getQueryWithSchema(event, anomaliesQuerySchema)
    const anomalies = anomalyService.getBySeverity(user.companyId, query.severity)
    return { anomalies }
  },

  async generateWorkflow(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageWorkflows(user), 'generate workflow')

    const body = await readBodyWithSchema(event, generateWorkflowSchema)

    const workflow = aiService.generateWorkflow(body.prompt)
    if (!workflow) {
      return {
        generated: false,
        message: 'could not generate a workflow from that description. try mentioning: inspection, onboarding, maintenance, dispatch, or safety.',
      }
    }

    return { generated: true, workflow }
  },

  explainEvent(event: H3Event) {
    requireAuth(event)

    const query = getQueryWithSchema(event, explainEventQuerySchema)
    const eventType = query.type ?? 'action'
    const action = query.action ?? null
    const route = query.route ?? '/'

    const explanation = aiService.explainEvent(eventType, action, route)
    return { explanation }
  },
}
