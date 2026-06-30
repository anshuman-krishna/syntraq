<script setup lang="ts">
import type { BlogPostSummary } from '@shared/types/blog'

definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'blog - syntraq',
  meta: [
    { name: 'description', content: 'field notes on operations, dispatch, maintenance, and the software that runs them. from the team building syntraq.' },
    { property: 'og:title', content: 'syntraq blog - notes from the field' },
    { property: 'og:description', content: 'field notes on operations, dispatch, maintenance, and the software that runs them.' },
    { property: 'og:type', content: 'website' },
  ],
})

const { data, pending } = await useFetch<{ posts: BlogPostSummary[]; total: number }>('/api/blog')

const posts = computed(() => data.value?.posts ?? [])
const featured = computed(() => posts.value[0])
const rest = computed(() => posts.value.slice(1))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-us', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="overflow-hidden">
    <!-- header -->
    <section class="relative pt-32 pb-12 px-6">
      <div class="absolute top-10 left-1/3 w-96 h-96 bg-sky-pastel/8 rounded-full blur-3xl animate-float" />
      <div class="absolute top-20 right-1/4 w-72 h-72 bg-mint/6 rounded-full blur-3xl animate-float" style="animation-delay: -3s;" />

      <div class="max-w-5xl mx-auto relative z-10 text-center animate-fade-in">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white/50 border border-glass-border bg-glass-white mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          notes from the field
        </div>
        <h1 class="text-4xl lg:text-5xl font-bold leading-tight mb-4">
          <span class="text-white">the </span><span class="text-gradient">syntraq</span><span class="text-white"> blog</span>
        </h1>
        <p class="text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
          field notes on operations, dispatch, maintenance, and the software that runs them.
        </p>
      </div>
    </section>

    <section class="pb-24 px-6">
      <div class="max-w-6xl mx-auto">
        <!-- loading -->
        <div v-if="pending" class="grid md:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="glass-card overflow-hidden">
            <div class="aspect-[5/3] bg-white/[0.03] animate-pulse" />
            <div class="p-6 space-y-3">
              <div class="h-3 w-20 rounded-full bg-white/5" />
              <div class="h-4 w-full rounded bg-white/5" />
              <div class="h-3 w-2/3 rounded bg-white/5" />
            </div>
          </div>
        </div>

        <template v-else>
          <!-- featured -->
          <NuxtLink
            v-if="featured"
            :to="`/blog/${featured.slug}`"
            class="group block glass-panel overflow-hidden mb-10 hover-lift"
          >
            <div class="grid md:grid-cols-2">
              <div class="aspect-[5/3] md:aspect-auto md:min-h-[280px]">
                <MarketingBlogCover :accent="featured.accent" :variant="featured.cover" :tag="featured.tag" />
              </div>
              <div class="p-8 lg:p-10 flex flex-col justify-center">
                <div class="flex items-center gap-3 text-xs text-white/35 mb-4">
                  <span>{{ formatDate(featured.publishedAt) }}</span>
                  <span class="w-1 h-1 rounded-full bg-white/20" />
                  <span>{{ featured.readMinutes }} min read</span>
                </div>
                <h2 class="text-2xl lg:text-3xl font-bold text-white/90 mb-3 group-hover:text-gradient transition-base">
                  {{ featured.title }}
                </h2>
                <p class="text-white/45 leading-relaxed mb-6">{{ featured.excerpt }}</p>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-pastel/30 to-mint/30 flex items-center justify-center text-[11px] font-semibold text-white/80">
                    {{ featured.author.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="text-xs">
                    <p class="text-white/70">{{ featured.author.name }}</p>
                    <p class="text-white/30">{{ featured.author.role }}</p>
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>

          <!-- grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="post in rest"
              :key="post.slug"
              :to="`/blog/${post.slug}`"
              class="group glass-card overflow-hidden hover-lift flex flex-col"
            >
              <div class="aspect-[5/3]">
                <MarketingBlogCover :accent="post.accent" :variant="post.cover" :tag="post.tag" />
              </div>
              <div class="p-6 flex flex-col flex-1">
                <div class="flex items-center gap-2 text-[11px] text-white/30 mb-3">
                  <span>{{ formatDate(post.publishedAt) }}</span>
                  <span class="w-1 h-1 rounded-full bg-white/20" />
                  <span>{{ post.readMinutes }} min</span>
                </div>
                <h3 class="text-lg font-semibold text-white/90 mb-2 leading-snug group-hover:text-gradient transition-base">
                  {{ post.title }}
                </h3>
                <p class="text-sm text-white/40 leading-relaxed line-clamp-3 flex-1">{{ post.excerpt }}</p>
                <span class="inline-flex items-center gap-1 text-xs text-white/40 group-hover:text-white/70 transition-base mt-5">
                  read more
                  <span class="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </span>
              </div>
            </NuxtLink>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
