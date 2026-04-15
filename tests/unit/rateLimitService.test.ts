import { describe, expect, it } from 'vitest'
import { rateLimitService } from '../../server/services/rateLimitService'

describe('rateLimitService', () => {
  it('allows requests under the limit and records remaining', () => {
    const key = `test-${Math.random()}`
    const first = rateLimitService.check(key, 'auth')
    expect(first.allowed).toBe(true)
    expect(first.remaining).toBe(19)
  })

  it('denies once the max requests for the window is exceeded', () => {
    const key = `test-${Math.random()}`
    for (let i = 0; i < 20; i++) {
      expect(rateLimitService.check(key, 'auth').allowed).toBe(true)
    }
    const blocked = rateLimitService.check(key, 'auth')
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('scopes counters per key so separate callers do not share a bucket', () => {
    const a = `test-${Math.random()}-a`
    const b = `test-${Math.random()}-b`
    for (let i = 0; i < 20; i++) rateLimitService.check(a, 'auth')
    expect(rateLimitService.check(a, 'auth').allowed).toBe(false)
    expect(rateLimitService.check(b, 'auth').allowed).toBe(true)
  })

  it('applies different ceilings per category', () => {
    const key = `test-${Math.random()}`
    const res = rateLimitService.check(key, 'publicKey')
    expect(res.remaining).toBe(299)
  })
})
