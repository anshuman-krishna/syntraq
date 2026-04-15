const COOKIE_NAME = 'syntraq-csrf'
const HEADER_NAME = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))
  return match?.slice(name.length + 1)
}

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      const method = (options.method ?? 'GET').toString().toUpperCase()
      if (SAFE_METHODS.has(method)) return

      const token = readCookie(COOKIE_NAME)
      if (!token) return

      const headers = new Headers(options.headers as HeadersInit | undefined)
      if (!headers.has(HEADER_NAME)) headers.set(HEADER_NAME, token)
      options.headers = headers
    },
  })
})
