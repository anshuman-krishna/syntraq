<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'features — syntraq',
  meta: [
    { name: 'description', content: 'explore syntraq features: roster management, smart dispatch, AI assistant, workflow builder, session replay, real-time fleet visibility, and more.' },
    { property: 'og:title', content: 'features — syntraq' },
    { property: 'og:description', content: 'everything your field-service team needs in one premium platform.' },
  ],
})

const coreFeatures = [
  {
    title: 'roster manager',
    description: 'build, manage, and optimize crew schedules with drag-and-drop simplicity. see who\'s available, who\'s on shift, and where gaps exist — all in real time.',
    highlights: ['drag-and-drop scheduling', 'availability tracking', 'conflict detection', 'timeline and 3d views'],
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'sky-pastel',
    gradient: 'from-sky-pastel/15 to-sky-pastel/5',
  },
  {
    title: 'workflow builder',
    description: 'create custom operational workflows without code. pre-trip inspections, onboarding checklists, maintenance routines — define the steps, syntraq handles the rest.',
    highlights: ['no-code step builder', 'reusable templates', 'status tracking', 'team assignment'],
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    color: 'mint',
    gradient: 'from-mint/15 to-mint/5',
  },
  {
    title: 'ai assistant',
    description: 'ask questions in plain english. "who\'s available tomorrow?" or "show me overdue inspections." syntraq\'s ai understands your operations and responds instantly.',
    highlights: ['natural language queries', 'operational context', 'action suggestions', 'always learning'],
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    color: 'peach',
    gradient: 'from-peach/15 to-peach/5',
  },
  {
    title: 'session replay',
    description: 'see exactly how your team uses syntraq. replay sessions to understand workflow patterns, identify training opportunities, and improve team efficiency.',
    highlights: ['full session recording', 'playback controls', 'event timeline', 'manager-only access'],
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'sky-pastel',
    gradient: 'from-sky-pastel/15 to-sky-pastel/5',
  },
]

const operationalFeatures = [
  {
    title: 'real-time fleet dashboard',
    description: 'live overview of drivers, vehicles, and shift statuses with 3d visualization.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'adaptive tutorials',
    description: 'context-aware guidance that teaches your team how to use each feature.',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    title: 'command palette',
    description: 'power-user keyboard shortcut (ctrl+k) to navigate, search, and execute actions.',
    icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    title: 'offline-first support',
    description: 'queue actions while offline. syntraq syncs automatically when connection returns.',
    icon: 'M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3',
  },
  {
    title: 'audit logging',
    description: 'full trail of who did what, when. required for compliance, useful for accountability.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    title: 'multi-tenant architecture',
    description: 'complete data isolation between companies. secure by design, scalable by nature.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
]
</script>

<template>
  <div class="overflow-hidden">
    <!-- hero -->
    <section class="pt-32 pb-16 px-6 relative">
      <div class="absolute top-20 right-1/4 w-80 h-80 bg-sky-pastel/6 rounded-full blur-3xl animate-float" />
      <div class="absolute bottom-0 left-1/3 w-64 h-64 bg-mint/5 rounded-full blur-3xl animate-float" style="animation-delay: -2s;" />

      <div class="max-w-7xl mx-auto text-center relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white/50 border border-glass-border bg-glass-white mb-6">
          platform capabilities
        </div>

        <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
          everything your team needs,<br />
          <span class="text-gradient">nothing it doesn't</span>
        </h1>
        <p class="text-lg text-white/40 max-w-lg mx-auto">
          purpose-built modules for trucking, hydrovac, and field-service operations. every feature solves a real problem.
        </p>
      </div>
    </section>

    <!-- core features (detailed) -->
    <section class="py-16 px-6">
      <div class="max-w-5xl mx-auto space-y-12">
        <div
          v-for="(feature, i) in coreFeatures"
          :key="feature.title"
          class="grid md:grid-cols-2 gap-10 items-center"
          :class="i % 2 === 1 ? 'md:direction-rtl' : ''"
        >
          <div :class="i % 2 === 1 ? 'md:order-2' : ''">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-5"
              :class="feature.gradient"
            >
              <svg class="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="feature.icon" />
              </svg>
            </div>

            <h2 class="text-2xl font-bold text-white mb-3 capitalize">{{ feature.title }}</h2>
            <p class="text-sm text-white/45 leading-relaxed mb-5">{{ feature.description }}</p>

            <div class="space-y-2">
              <div
                v-for="h in feature.highlights"
                :key="h"
                class="flex items-center gap-2.5 text-sm text-white/60"
              >
                <svg class="w-4 h-4 text-mint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ h }}
              </div>
            </div>
          </div>

          <!-- visual placeholder -->
          <div :class="i % 2 === 1 ? 'md:order-1' : ''">
            <div class="glass-panel p-2">
              <div class="glass-card p-6 aspect-[4/3] flex items-center justify-center">
                <div class="text-center">
                  <div
                    class="w-16 h-16 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center"
                    :class="feature.gradient"
                  >
                    <svg class="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" :d="feature.icon" />
                    </svg>
                  </div>
                  <div class="h-2 w-24 rounded-full bg-white/8 mx-auto mb-2" />
                  <div class="h-2 w-16 rounded-full bg-white/5 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- operational features grid -->
    <section class="py-24 px-6 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-sky-pastel/[0.02] to-transparent" />

      <div class="max-w-5xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">
            and <span class="text-gradient">so much more</span>
          </h2>
          <p class="text-white/40 max-w-md mx-auto">
            built-in capabilities that make syntraq a complete operations platform.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-5">
          <div
            v-for="f in operationalFeatures"
            :key="f.title"
            class="glass-card p-6 group hover-lift"
          >
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] flex items-center justify-center mb-4 group-hover:from-sky-pastel/10 group-hover:to-mint/5 transition-base">
              <svg class="w-5 h-5 text-white/50 group-hover:text-white/70 transition-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="f.icon" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-white/80 mb-1.5 capitalize">{{ f.title }}</h3>
            <p class="text-xs text-white/35 leading-relaxed">{{ f.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- cta -->
    <section class="py-16 px-6">
      <div class="max-w-xl mx-auto text-center glass-panel p-10 relative overflow-hidden">
        <div class="absolute inset-0 gradient-mesh opacity-40" />
        <div class="relative z-10">
          <h2 class="text-2xl font-bold text-white mb-3">see it in action</h2>
          <p class="text-sm text-white/40 mb-6">start with the free plan and explore every feature.</p>
          <div class="flex items-center justify-center gap-4">
            <NuxtLink to="/register">
              <UiButton variant="primary" size="lg">get started free</UiButton>
            </NuxtLink>
            <NuxtLink to="/pricing">
              <UiButton variant="ghost" size="lg">view pricing</UiButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
