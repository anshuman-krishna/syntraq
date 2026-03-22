import { realtimeService } from '../services/realtimeService'
import { generateId } from '../../shared/utils/id'

export default defineEventHandler((event) => {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'not authenticated' })
  }

  const connectionId = generateId()
  const companyId = user.companyId

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const stream = new ReadableStream({
    start(controller) {
      // send initial connection event
      const initial = JSON.stringify({
        type: 'connected',
        connectionId,
        presence: realtimeService.getCompanyPresence(companyId),
      })
      controller.enqueue(`data: ${initial}\n\n`)

      // register listener
      realtimeService.subscribe(connectionId, user.id, user.name, companyId, (realtimeEvent) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(realtimeEvent)}\n\n`)
        } catch {
          // stream closed
        }
      })

      // heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`)
        } catch {
          clearInterval(heartbeat)
        }
      }, 15_000)

      // cleanup on close
      event.node.req.on('close', () => {
        clearInterval(heartbeat)
        realtimeService.unsubscribe(connectionId)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})
