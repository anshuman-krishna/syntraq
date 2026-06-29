import { afterEach, describe, expect, it } from 'vitest'
import { healthService } from '../../server/services/healthService'

describe('healthService config checks', () => {
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.ERROR_WEBHOOK_URL
  })

  it('reports integration config presence', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    delete process.env.ERROR_WEBHOOK_URL

    const result = healthService.check()

    expect(result.checks.ai?.message).toBe('configured')
    expect(result.checks.errorSink?.message).toBe('not configured')
    expect(result.checks.stripe).toBeDefined()
    expect(result.checks).toHaveProperty('uptime')
  })
})
