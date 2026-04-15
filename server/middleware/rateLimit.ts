import { rateLimitService, type RateLimitCategory } from '../services/rateLimitService'
import { apiError } from '../utils/errors'

interface Tier {
  key: string
  category: RateLimitCategory
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return
  if (path === '/api/billing/webhook') return

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const tiers: Tier[] = []

  if (path.startsWith('/api/auth/')) {
    tiers.push({ key: `auth:ip:${ip}`, category: 'auth' })
  } else if (path.startsWith('/api/public/')) {
    // public api — prefer per-key limit, fall back to ip
    const keyId = event.context.apiKey?.keyId
    tiers.push({ key: keyId ? `public:key:${keyId}` : `public:ip:${ip}`, category: 'publicKey' })
  } else {
    // internal api — always apply an ip tier, and add a session tier when logged in
    tiers.push({ key: `api:ip:${ip}`, category: 'api' })
    const userId = event.context.user?.id
    if (userId) tiers.push({ key: `api:session:${userId}`, category: 'session' })
  }

  let strictest: ReturnType<typeof rateLimitService.check> | null = null
  for (const tier of tiers) {
    const result = rateLimitService.check(tier.key, tier.category)
    if (!strictest || result.remaining < strictest.remaining) strictest = result
    if (!result.allowed) {
      setResponseHeader(event, 'X-RateLimit-Remaining', '0')
      setResponseHeader(event, 'X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
      throw apiError('rate_limited', 'too many requests. please try again later.', undefined, event)
    }
  }

  if (strictest) {
    setResponseHeader(event, 'X-RateLimit-Remaining', String(strictest.remaining))
    setResponseHeader(event, 'X-RateLimit-Reset', String(Math.ceil(strictest.resetAt / 1000)))
  }
})
