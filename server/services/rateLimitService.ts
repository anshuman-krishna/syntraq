interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 60_000)

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export type RateLimitCategory = 'auth' | 'api' | 'publicKey' | 'session' | 'webhook'

const CONFIGS: Record<RateLimitCategory, RateLimitConfig> = {
  auth: { windowMs: 15 * 60_000, maxRequests: 20 },
  api: { windowMs: 60_000, maxRequests: 100 },
  publicKey: { windowMs: 60_000, maxRequests: 300 },
  session: { windowMs: 60_000, maxRequests: 300 },
  webhook: { windowMs: 60_000, maxRequests: 200 },
}

export const rateLimitService = {
  check(key: string, category: RateLimitCategory = 'api'): { allowed: boolean; remaining: number; resetAt: number } {
    const config = CONFIGS[category]
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + config.windowMs })
      return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
    }

    entry.count++
    const allowed = entry.count <= config.maxRequests
    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetAt: entry.resetAt,
    }
  },
}
