import { describe, expect, it } from 'vitest'
import { blogService } from '../../server/services/blogService'

describe('blogService', () => {
  it('lists every post as a summary without the body sections', () => {
    const summaries = blogService.listSummaries()
    expect(summaries.length).toBeGreaterThanOrEqual(6)
    for (const s of summaries) {
      expect(s).not.toHaveProperty('sections')
      expect(s.slug).toBeTruthy()
      expect(s.title).toBeTruthy()
      expect(['sky', 'mint', 'peach']).toContain(s.accent)
    }
  })

  it('orders posts newest first', () => {
    const dates = blogService.listSummaries().map(p => p.publishedAt)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })

  it('exposes unique slugs', () => {
    const slugs = blogService.listSummaries().map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('returns a full post with sections by slug', () => {
    const first = blogService.listSummaries()[0]!
    const post = blogService.getBySlug(first.slug)
    expect(post).toBeDefined()
    expect(post!.sections.length).toBeGreaterThan(0)
    expect(post!.sections.every(s => s.body.length > 0)).toBe(true)
  })

  it('returns undefined for an unknown slug', () => {
    expect(blogService.getBySlug('does-not-exist')).toBeUndefined()
  })

  it('relates other posts, excluding the current one', () => {
    const slug = blogService.listSummaries()[0]!.slug
    const related = blogService.related(slug)
    expect(related.length).toBeLessThanOrEqual(3)
    expect(related.some(p => p.slug === slug)).toBe(false)
  })
})
