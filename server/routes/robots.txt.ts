// dynamic robots.txt so the Sitemap line points at the right base url per env
// (the static file could only ever hardcode one host). crawl the public
// marketing site; keep the app and api out of the index.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const base = (config.public.appUrl || 'http://localhost:3000').replace(/\/$/, '')

  const body = `User-Agent: *
Disallow: /dashboard
Disallow: /api/

Sitemap: ${base}/sitemap.xml
`

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return body
})
