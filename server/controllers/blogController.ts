import { setHeader, type H3Event } from 'h3'
import { z } from 'zod'
import { blogService } from '../services/blogService'
import { apiError } from '../utils/errors'
import { getParamsWithSchema } from '../utils/validation'

const slugParamSchema = z.object({
  slug: z.string().trim().min(1).max(120),
})

// public marketing content: cacheable, no auth, no tenant scope.
function setPublicCache(event: H3Event) {
  setHeader(event, 'Cache-Control', 'public, max-age=300')
}

export const blogController = {
  listPosts(event: H3Event) {
    setPublicCache(event)
    const posts = blogService.listSummaries()
    return { posts, total: posts.length }
  },

  getPost(event: H3Event) {
    const { slug } = getParamsWithSchema(event, slugParamSchema)

    const post = blogService.getBySlug(slug)
    if (!post) {
      throw apiError('not_found', 'post not found', { slug }, event)
    }

    setPublicCache(event)
    return { post, related: blogService.related(slug) }
  },
}
