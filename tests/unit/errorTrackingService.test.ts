import { afterEach, describe, expect, it, vi } from 'vitest'
import { errorTrackingService } from '../../server/services/errorTrackingService'

describe('errorTrackingService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.ERROR_WEBHOOK_URL
  })

  it('captures without throwing when no sink is configured', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    expect(() =>
      errorTrackingService.capture({ source: 'client', scope: 'test', message: 'boom' }),
    ).not.toThrow()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('forwards to the sink when ERROR_WEBHOOK_URL is set', async () => {
    process.env.ERROR_WEBHOOK_URL = 'https://sink.example.com/ingest'
    const fetchSpy = vi.fn(async () => new Response('ok', { status: 200 }))
    vi.stubGlobal('fetch', fetchSpy)

    errorTrackingService.capture({ source: 'server', scope: 'GET /x', message: 'kaboom' })
    // forwarding is fire-and-forget; let the microtask flush
    await Promise.resolve()

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]!
    expect(url).toBe('https://sink.example.com/ingest')
    expect(JSON.parse((init as RequestInit).body as string)).toMatchObject({ source: 'server', message: 'kaboom' })
  })

  it('swallows sink delivery failures', async () => {
    process.env.ERROR_WEBHOOK_URL = 'https://sink.example.com/ingest'
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down') }))

    await expect(
      errorTrackingService.forward('https://sink.example.com/ingest', { source: 'client', scope: 's', message: 'm' }),
    ).resolves.toBeUndefined()
  })
})
