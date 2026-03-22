import { rateLimitService } from '../services/rateLimitService'

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // skip non-api routes
  if (!path.startsWith('/api/')) return

  // skip public endpoints and webhooks
  if (path.startsWith('/api/public/')) return
  if (path === '/api/billing/webhook') return

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  // auth routes get stricter limits, public api gets its own category
  const category = path.startsWith('/api/auth/') ? 'auth'
    : path.startsWith('/api/public/') ? 'api'
    : 'api'
  const key = `${category}:${ip}`

  const result = rateLimitService.check(key, category)

  setResponseHeader(event, 'X-RateLimit-Remaining', String(result.remaining))
  setResponseHeader(event, 'X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

  if (!result.allowed) {
    throw createError({
      statusCode: 429,
      message: 'too many requests. please try again later.',
    })
  }
})
