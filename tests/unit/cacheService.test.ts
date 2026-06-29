import { afterEach, describe, expect, it, vi } from 'vitest'
import { cacheService } from '../../server/services/cacheService'

describe('cacheService', () => {
  afterEach(() => {
    cacheService.clear()
    vi.useRealTimers()
  })

  it('stores and retrieves a value', () => {
    cacheService.set('k', { n: 1 })
    expect(cacheService.get<{ n: number }>('k')).toEqual({ n: 1 })
  })

  it('returns null for a missing key', () => {
    expect(cacheService.get('absent')).toBeNull()
  })

  it('expires entries past their ttl', () => {
    vi.useFakeTimers()
    cacheService.set('k', 'v', 1000)
    vi.advanceTimersByTime(1001)
    expect(cacheService.get('k')).toBeNull()
  })

  it('invalidates a single key', () => {
    cacheService.set('k', 'v')
    cacheService.invalidate('k')
    expect(cacheService.get('k')).toBeNull()
  })

  it('invalidates every key under a prefix', () => {
    cacheService.set('shifts:1', 'a')
    cacheService.set('shifts:2', 'b')
    cacheService.set('employees:1', 'c')
    cacheService.invalidatePrefix('shifts:')
    expect(cacheService.get('shifts:1')).toBeNull()
    expect(cacheService.get('shifts:2')).toBeNull()
    expect(cacheService.get('employees:1')).toBe('c')
  })

  it('computes and caches with getOrSet', async () => {
    const fn = vi.fn(() => 42)
    const first = await cacheService.getOrSet('k', fn)
    const second = await cacheService.getOrSet('k', fn)
    expect(first).toBe(42)
    expect(second).toBe(42)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('reports active vs expired counts', () => {
    vi.useFakeTimers()
    cacheService.set('fresh', 'a', 10_000)
    cacheService.set('stale', 'b', 1000)
    vi.advanceTimersByTime(2000)
    const stats = cacheService.stats()
    expect(stats.size).toBe(2)
    expect(stats.expired).toBe(1)
    expect(stats.active).toBe(1)
  })
})
