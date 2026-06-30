<script setup lang="ts">
import type { BlogPost, BlogPostSummary } from '@shared/types/blog'

definePageMeta({
  layout: 'landing',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data, error } = await useFetch<{ post: BlogPost; related: BlogPostSummary[] }>(
  () => `/api/blog/${slug.value}`,
)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'post not found', fatal: true })
}

const post = computed(() => data.value!.post)
const related = computed(() => data.value!.related)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-us', { month: 'long', day: 'numeric', year: 'numeric' })
}

useHead(() => ({
  title: `${post.value.title} - syntraq`,
  meta: [
    { name: 'description', content: post.value.excerpt },
    { property: 'og:title', content: post.value.title },
    { property: 'og:description', content: post.value.excerpt },
    { property: 'og:type', content: 'article' },
    { property: 'article:published_time', content: post.value.publishedAt },
  ],
}))
</script>

<template>
  <div class="overflow-hidden">
    <article class="pt-28 pb-20 px-6">
      <div class="max-w-3xl mx-auto">
        <!-- breadcrumb -->
        <NuxtLink to="/blog" class="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-base mb-8">
          <span class="transition-transform group-hover:-translate-x-0.5">&larr;</span>
          all posts
        </NuxtLink>

        <!-- header -->
        <div class="animate-fade-in">
          <div class="flex items-center gap-3 text-xs text-white/35 mb-4">
            <span class="px-2.5 py-1 rounded-full uppercase tracking-wider text-white/70 bg-glass-white border border-glass-border">{{ post.tag }}</span>
            <span>{{ formatDate(post.publishedAt) }}</span>
            <span class="w-1 h-1 rounded-full bg-white/20" />
            <span>{{ post.readMinutes }} min read</span>
          </div>

          <h1 class="text-3xl lg:text-5xl font-bold text-white leading-tight mb-6">{{ post.title }}</h1>
          <p class="text-lg text-white/50 leading-relaxed mb-8">{{ post.excerpt }}</p>

          <div class="flex items-center gap-3 pb-8 border-b border-glass-border">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-pastel/30 to-mint/30 flex items-center justify-center text-sm font-semibold text-white/80">
              {{ post.author.name.charAt(0).toUpperCase() }}
            </div>
            <div class="text-sm">
              <p class="text-white/80 font-medium">{{ post.author.name }}</p>
              <p class="text-white/35 text-xs">{{ post.author.role }}</p>
            </div>
          </div>
        </div>

        <!-- cover -->
        <div class="glass-panel overflow-hidden my-10">
          <div class="aspect-[16/7]">
            <MarketingBlogCover :accent="post.accent" :variant="post.cover" />
          </div>
        </div>

        <!-- body -->
        <div class="space-y-8">
          <section v-for="(section, i) in post.sections" :key="i">
            <h2 v-if="section.heading" class="text-xl lg:text-2xl font-semibold text-white/90 mb-4">{{ section.heading }}</h2>
            <p v-for="(para, j) in section.body" :key="j" class="text-white/55 leading-relaxed text-[15px] lg:text-base mb-4 last:mb-0">
              {{ para }}
            </p>
          </section>
        </div>

        <!-- inline cta -->
        <div class="glass-panel p-8 mt-14 relative overflow-hidden text-center">
          <div class="absolute inset-0 gradient-mesh opacity-40" />
          <div class="relative z-10">
            <h3 class="text-xl font-semibold text-white mb-2">see it in your own operation</h3>
            <p class="text-sm text-white/45 mb-6 max-w-md mx-auto">
              start free and turn your schedule into the source of truth your whole team runs on.
            </p>
            <NuxtLink to="/register">
              <UiButton variant="primary" size="md">start free trial</UiButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </article>

    <!-- related -->
    <section v-if="related.length" class="pb-24 px-6">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">keep reading</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="r in related"
            :key="r.slug"
            :to="`/blog/${r.slug}`"
            class="group glass-card overflow-hidden hover-lift flex flex-col"
          >
            <div class="aspect-[5/3]">
              <MarketingBlogCover :accent="r.accent" :variant="r.cover" :tag="r.tag" />
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="text-base font-semibold text-white/90 mb-2 leading-snug group-hover:text-gradient transition-base">{{ r.title }}</h3>
              <p class="text-xs text-white/40 leading-relaxed line-clamp-2">{{ r.excerpt }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
