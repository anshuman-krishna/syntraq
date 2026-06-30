import { blogService } from '../services/blogService'

// dynamic sitemap: the static marketing pages plus every published blog post.
// blog entries carry a lastmod from their publish date so crawlers can tell
// what changed. base url comes from runtimeConfig so it is correct per env.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const base = (config.public.appUrl || 'http://localhost:3000').replace(/\/$/, '')

  const staticPages: Array<{ path: string; priority: string }> = [
    { path: '/', priority: '1.0' },
    { path: '/features', priority: '0.8' },
    { path: '/pricing', priority: '0.8' },
    { path: '/about', priority: '0.6' },
    { path: '/blog', priority: '0.7' },
  ]

  const urls = staticPages.map(p => ({
    loc: `${base}${p.path}`,
    priority: p.priority,
    lastmod: undefined as string | undefined,
  }))

  for (const post of blogService.listSummaries()) {
    urls.push({
      loc: `${base}/blog/${post.slug}`,
      priority: '0.6',
      lastmod: post.publishedAt.slice(0, 10),
    })
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => {
    const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    return `  <url>\n    <loc>${u.loc}</loc>${lastmod}\n    <priority>${u.priority}</priority>\n  </url>`
  })
  .join('\n')}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return body
})
