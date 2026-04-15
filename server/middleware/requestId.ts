import { randomUUID } from 'crypto'

declare module 'h3' {
  interface H3EventContext {
    requestId: string
  }
}

const HEADER = 'x-request-id'

export default defineEventHandler((event) => {
  const existing = getRequestHeader(event, HEADER)
  const id = existing && /^[a-zA-Z0-9_-]{8,64}$/.test(existing) ? existing : randomUUID()

  event.context.requestId = id
  setResponseHeader(event, 'X-Request-Id', id)
})
