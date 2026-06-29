import { db } from '../db/client'
import { companies } from '../db/schema'
import { cacheService } from './cacheService'

function configCheck(value: string | undefined): { status: string; message: string } {
  return { status: 'ok', message: value ? 'configured' : 'not configured' }
}

export const healthService = {
  check() {
    const checks: Record<string, { status: string; message?: string }> = {}

    // database
    try {
      db.select().from(companies).limit(1).all()
      checks.database = { status: 'ok' }
    } catch (e) {
      checks.database = { status: 'error', message: e instanceof Error ? e.message : 'unknown' }
    }

    // cache
    const cacheStats = cacheService.stats()
    checks.cache = { status: 'ok', message: `${cacheStats.active} entries` }

    // memory
    const memUsage = process.memoryUsage()
    const heapUsedMb = Math.round(memUsage.heapUsed / 1024 / 1024)
    const heapTotalMb = Math.round(memUsage.heapTotal / 1024 / 1024)
    checks.memory = {
      status: heapUsedMb > heapTotalMb * 0.9 ? 'warning' : 'ok',
      message: `${heapUsedMb}/${heapTotalMb} MB`,
    }

    // uptime
    checks.uptime = { status: 'ok', message: `${Math.round(process.uptime())}s` }

    // integration config presence — surfaced so ops can see what's wired without
    // making a live network call on every health check.
    checks.stripe = configCheck(process.env.STRIPE_SECRET_KEY)
    checks.ai = configCheck(process.env.ANTHROPIC_API_KEY)
    checks.errorSink = configCheck(process.env.ERROR_WEBHOOK_URL)

    const overallStatus = Object.values(checks).some(c => c.status === 'error') ? 'degraded' : 'healthy'

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    }
  },
}
