// cors is intentionally strict and only applies to the public integration api.
// the same-origin app (nuxt) does not need cors because it's served from the same host.

const DEFAULT_ALLOWLIST = [
  'http://localhost:3000',
]

function allowlist(): string[] {
  const raw = process.env.PUBLIC_API_CORS_ORIGINS
  if (!raw) return DEFAULT_ALLOWLIST
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/public/')) return

  const origin = getRequestHeader(event, 'origin')
  const allowed = allowlist()

  if (origin && allowed.includes(origin)) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
    setResponseHeader(event, 'Vary', 'Origin')
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'false')
    setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
    setResponseHeader(event, 'Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Request-Id')
    setResponseHeader(event, 'Access-Control-Max-Age', 86400)
  }

  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
