import type { H3Event } from 'h3'
import { predictionService } from '../services/predictionService'
import { anomalyService } from '../services/anomalyService'
import { aiService } from '../services/aiService'
import { requireAuth, requirePermission } from '../utils/auth'
import { permissionService } from '../services/permissionService'

export const intelligenceController = {
  getPredictions(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view predictions')

    const query = getQuery(event)
    const date = typeof query.date === 'string' ? query.date : undefined
    const predictions = predictionService.getPredictions(user.companyId, date)
    return { predictions }
  },

  getAnomalies(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canViewRoster(user), 'view anomalies')

    const query = getQuery(event)
    const severity = typeof query.severity === 'string' ? query.severity : undefined
    const anomalies = anomalyService.getBySeverity(user.companyId, severity)
    return { anomalies }
  },

  async generateWorkflow(event: H3Event) {
    const user = requireAuth(event)
    requirePermission(user, permissionService.canManageWorkflows(user), 'generate workflow')

    const body = await readBody(event)
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : ''
    if (!prompt || prompt.length > 500) {
      throw createError({ statusCode: 400, message: 'prompt must be 1-500 characters' })
    }

    const workflow = aiService.generateWorkflow(prompt)
    if (!workflow) {
      return {
        generated: false,
        message: 'could not generate a workflow from that description. try mentioning: inspection, onboarding, maintenance, dispatch, or safety.',
      }
    }

    return { generated: true, workflow }
  },

  explainEvent(event: H3Event) {
    const user = requireAuth(event)

    const query = getQuery(event)
    const eventType = typeof query.type === 'string' ? query.type : 'action'
    const action = typeof query.action === 'string' ? query.action : null
    const route = typeof query.route === 'string' ? query.route : '/'

    const explanation = aiService.explainEvent(eventType, action, route)
    return { explanation }
  },
}
