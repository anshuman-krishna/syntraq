export default defineEventHandler((event) => {
  // security headers
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'X-XSS-Protection', '1; mode=block')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')

  setResponseHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

  if (process.env.NODE_ENV === 'production') {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    setResponseHeader(event, 'Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.stripe.com")
  }
})
