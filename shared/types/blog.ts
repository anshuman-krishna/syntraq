export type BlogAccent = 'sky' | 'mint' | 'peach'

export interface BlogAuthor {
  name: string
  role: string
}

export interface BlogSection {
  heading?: string
  body: string[]
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  tag: string
  accent: BlogAccent
  cover: number
  readMinutes: number
  publishedAt: string
  author: BlogAuthor
  sections: BlogSection[]
}

export type BlogPostSummary = Omit<BlogPost, 'sections'>
