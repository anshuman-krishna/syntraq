import { realtimeService } from '../../services/realtimeService'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  if (typeof body?.route !== 'string') {
    throw createError({ statusCode: 400, message: 'route is required' })
  }

  realtimeService.updatePresence({
    userId: user.id,
    userName: user.name,
    route: body.route,
    entityId: body.entityId ?? undefined,
    action: body.action === 'editing' ? 'editing' : 'viewing',
    lastSeen: new Date().toISOString(),
  }, user.companyId)

  return { ok: true }
})
