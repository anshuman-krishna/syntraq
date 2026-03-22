import { replayComparisonService } from '../../services/replayComparisonService'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const query = getQuery(event)

  const sessionA = typeof query.a === 'string' ? query.a : ''
  const sessionB = typeof query.b === 'string' ? query.b : ''

  if (!sessionA || !sessionB) {
    throw createError({ statusCode: 400, message: 'both session ids (a, b) required' })
  }

  const result = replayComparisonService.compare(sessionA, sessionB, user.companyId)
  return { comparison: result }
})
