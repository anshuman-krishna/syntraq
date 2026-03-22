import { performanceScoringService } from '../../services/performanceScoringService'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const query = getQuery(event)

  const sessionId = typeof query.session === 'string' ? query.session : ''
  if (!sessionId) {
    throw createError({ statusCode: 400, message: 'session id required' })
  }

  const score = performanceScoringService.score(sessionId, user.companyId)
  return { score }
})
