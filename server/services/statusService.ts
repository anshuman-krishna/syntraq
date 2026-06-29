import { healthService } from './healthService'

interface StatusSample {
  timestamp: string
  status: string
}

// in-memory ring buffer of recent health samples. like the rate-limit and
// realtime stores this is per-process; fine for a single instance, and a status
// strip tolerates per-instance drift well.
const MAX_SAMPLES = 60
const MIN_INTERVAL_MS = 30_000

const samples: StatusSample[] = []
let lastRecordedAt = 0

export const statusService = {
  // record a fresh sample when the buffer is stale, then return the rollup.
  snapshot() {
    const now = Date.now()
    if (now - lastRecordedAt >= MIN_INTERVAL_MS || samples.length === 0) {
      const health = healthService.check()
      samples.push({ timestamp: new Date(now).toISOString(), status: health.status })
      if (samples.length > MAX_SAMPLES) samples.shift()
      lastRecordedAt = now
    }

    const healthy = samples.filter(s => s.status === 'healthy').length
    const uptime = samples.length ? Math.round((healthy / samples.length) * 100) : 100

    return {
      status: samples[samples.length - 1]?.status ?? 'healthy',
      uptime,
      samples: [...samples],
    }
  },

  // test seam — reset the buffer between runs
  reset() {
    samples.length = 0
    lastRecordedAt = 0
  },
}
