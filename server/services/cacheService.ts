interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

// default ttl: 60 seconds
const DEFAULT_TTL = 60 * 1000

export const cacheService = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }

    return entry.data
  },

  set<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
    store.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    })
  },

  invalidate(key: string): void {
    store.delete(key)
  },

  invalidatePrefix(prefix: string): void {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) {
        store.delete(key)
      }
    }
  },

  clear(): void {
    store.clear()
  },

  // helper: get or compute
  async getOrSet<T>(key: string, fn: () => T | Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) return cached

    const data = await fn()
    this.set(key, data, ttl)
    return data
  },

  stats() {
    let expired = 0
    const now = Date.now()
    for (const entry of store.values()) {
      if (now > entry.expiresAt) expired++
    }
    return {
      size: store.size,
      expired,
      active: store.size - expired,
    }
  },
}
