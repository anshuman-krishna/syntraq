import { apiUsageModel } from '../models/apiUsageModel'
import { apiKeyModel } from '../models/apiKeyModel'

const HOUR_MS = 60 * 60 * 1000
const MAX_RECENT = 25

function statusBucket(status: number): '2xx' | '3xx' | '4xx' | '5xx' | 'error' {
  if (status === 0) return 'error'
  if (status >= 500) return '5xx'
  if (status >= 400) return '4xx'
  if (status >= 300) return '3xx'
  return '2xx'
}

export const apiUsageService = {
  // read-only rollup of api_usage_logs for the last `hours` window, scoped to company.
  summary(companyId: string, hours: number) {
    const since = new Date(Date.now() - hours * HOUR_MS)
    const logs = apiUsageModel.findRecent(companyId, since)

    const keyNames = new Map(apiKeyModel.findAll(companyId).map(k => [k.id, k.name]))

    const statusCounts: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0, error: 0 }
    const byKey = new Map<string, number>()
    let totalResponseTime = 0
    let timedCalls = 0

    // hourly time series, oldest → newest
    const buckets = Array.from({ length: hours }, (_, i) => ({
      hour: new Date(since.getTime() + i * HOUR_MS).toISOString(),
      calls: 0,
    }))

    for (const log of logs) {
      statusCounts[statusBucket(log.statusCode)]! += 1
      byKey.set(log.apiKeyId, (byKey.get(log.apiKeyId) ?? 0) + 1)

      if (log.responseTime != null) {
        totalResponseTime += log.responseTime
        timedCalls += 1
      }

      const createdAt = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt)
      const idx = Math.floor((createdAt.getTime() - since.getTime()) / HOUR_MS)
      if (idx >= 0 && idx < buckets.length) buckets[idx]!.calls += 1
    }

    return {
      totalCalls: logs.length,
      avgResponseTime: timedCalls ? Math.round(totalResponseTime / timedCalls) : 0,
      statusCounts,
      byKey: [...byKey.entries()]
        .map(([keyId, calls]) => ({ keyId, name: keyNames.get(keyId) ?? 'revoked key', calls }))
        .sort((a, b) => b.calls - a.calls),
      timeSeries: buckets,
      recent: logs.slice(0, MAX_RECENT).map(log => ({
        keyName: keyNames.get(log.apiKeyId) ?? 'revoked key',
        method: log.method,
        path: log.path,
        statusCode: log.statusCode,
        responseTime: log.responseTime,
        createdAt: log.createdAt,
      })),
    }
  },
}
