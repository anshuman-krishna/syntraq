import { randomBytes } from 'crypto'
import { apiError } from '../utils/errors'

const COOKIE_NAME = 'syntraq-csrf'
const HEADER_NAME = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// paths that authenticate by signature or api key rather than session cookies —
// csrf does not apply there. keep this list tight.
const EXEMPT_EXACT = new Set([
  '/api/billing/webhook',
])

function isExempt(path: string): boolean {
  if (EXEMPT_EXACT.has(path)) return true
  // public api uses bearer api keys, not session cookies
  if (path.startsWith('/api/public/')) return true
  return false
}

function issueToken(): string {
  return randomBytes(24).toString('base64url')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return out === 0
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // always ensure the client has a csrf cookie it can echo back. we set it
  // on every request (api or page) so first-visit POSTs to /api/ have a token.
  let token = getCookie(event, COOKIE_NAME)
  if (!token) {
    token = issueToken()
    setCookie(event, COOKIE_NAME, token, {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  // validation only gates /api/ unsafe methods
  if (!path.startsWith('/api/')) return

  const method = getMethod(event)
  if (SAFE_METHODS.has(method)) return
  if (isExempt(path)) return

  const submitted = getRequestHeader(event, HEADER_NAME)
  if (!submitted || !timingSafeEqual(submitted, token)) {
    throw apiError('csrf_failed', 'csrf token missing or invalid', { path }, event)
  }
})
