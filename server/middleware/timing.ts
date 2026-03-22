export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const start = Date.now()

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    // add server timing header for observability
    setResponseHeader(event, 'Server-Timing', `total;dur=${duration}`)

    // log slow requests in production
    if (duration > 1000) {
      console.warn(`[slow-request] ${getMethod(event)} ${path} took ${duration}ms`)
    }
  })
})
