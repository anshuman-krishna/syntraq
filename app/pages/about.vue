<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'about — syntraq',
  meta: [
    { name: 'description', content: 'syntraq is building the future of field-service operations. learn about our mission to replace chaos with clarity for trucking, hydrovac, and service companies.' },
    { property: 'og:title', content: 'about — syntraq' },
    { property: 'og:description', content: 'building the future of field-service operations.' },
  ],
})

const values = [
  {
    title: 'clarity over complexity',
    description: 'operations are complex enough. our software should make things clearer, not add another layer of confusion.',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
  {
    title: 'built for the field',
    description: 'every feature is tested against real operational scenarios. we don\'t build for demos — we build for 5am dispatches and muddy job sites.',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'speed as a feature',
    description: 'your team shouldn\'t wait for software. every interaction is designed to feel instant, from page loads to data queries.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'human-first design',
    description: 'technology should adapt to people, not the other way around. syntraq learns how your team works and adjusts accordingly.',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
]

const milestones = [
  { label: 'idea + research', status: 'complete' },
  { label: 'core platform built', status: 'complete' },
  { label: 'beta launch', status: 'current' },
  { label: 'public launch', status: 'upcoming' },
  { label: 'mobile app', status: 'upcoming' },
  { label: 'marketplace + integrations', status: 'upcoming' },
]
</script>

<template>
  <div class="overflow-hidden">
    <!-- hero -->
    <section class="pt-32 pb-16 px-6 relative">
      <div class="absolute top-32 left-1/4 w-72 h-72 bg-mint/5 rounded-full blur-3xl animate-float" />
      <div class="absolute bottom-0 right-1/3 w-64 h-64 bg-peach/4 rounded-full blur-3xl animate-float" style="animation-delay: -2s;" />

      <div class="max-w-3xl mx-auto text-center relative z-10">
        <h1 class="text-4xl lg:text-5xl font-bold text-white mb-6">
          replacing chaos<br />
          <span class="text-gradient">with clarity</span>
        </h1>
        <p class="text-lg text-white/40 max-w-lg mx-auto leading-relaxed">
          field-service operations are the backbone of critical infrastructure. they deserve better tools than spreadsheets and radio calls.
        </p>
      </div>
    </section>

    <!-- story -->
    <section class="py-24 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="glass-card p-10 space-y-6">
          <h2 class="text-2xl font-bold text-white">the problem we saw</h2>
          <p class="text-sm text-white/50 leading-relaxed">
            trucking companies, hydrovac operators, and field-service teams run complex operations with outdated tools. scheduling happens on whiteboards. dispatch relies on phone calls. billing is a manual nightmare that costs hours every week.
          </p>
          <p class="text-sm text-white/50 leading-relaxed">
            these companies move the economy. they maintain infrastructure, deliver goods, and keep systems running. yet the software available to them is either too generic, too expensive, or built by people who've never stepped foot on a job site.
          </p>
          <p class="text-sm text-white/50 leading-relaxed">
            syntraq was built to change that. not with another enterprise suite that takes months to implement, but with an adaptive platform that feels intuitive from day one and scales as operations grow.
          </p>
        </div>
      </div>
    </section>

    <!-- values -->
    <section class="py-24 px-6 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-sky-pastel/[0.015] to-transparent" />

      <div class="max-w-5xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-white mb-4">what drives us</h2>
          <p class="text-white/40 max-w-md mx-auto">
            principles that shape every decision, from code architecture to ui spacing.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="v in values" :key="v.title" class="glass-card p-8 group hover-lift">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] flex items-center justify-center mb-4 group-hover:from-sky-pastel/10 group-hover:to-mint/5 transition-base">
              <svg class="w-5 h-5 text-white/50 group-hover:text-white/70 transition-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="v.icon" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white/85 mb-2">{{ v.title }}</h3>
            <p class="text-sm text-white/40 leading-relaxed">{{ v.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- roadmap -->
    <section class="py-24 px-6">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-white mb-4">where we're headed</h2>
          <p class="text-white/40">building in public. shipping fast.</p>
        </div>

        <div class="space-y-3">
          <div
            v-for="m in milestones"
            :key="m.label"
            class="glass-card px-6 py-4 flex items-center gap-4"
          >
            <div
              class="w-3 h-3 rounded-full shrink-0"
              :class="{
                'bg-mint': m.status === 'complete',
                'bg-sky-pastel animate-pulse': m.status === 'current',
                'bg-white/10': m.status === 'upcoming',
              }"
            />
            <span
              class="text-sm"
              :class="{
                'text-white/60': m.status === 'complete',
                'text-white font-medium': m.status === 'current',
                'text-white/30': m.status === 'upcoming',
              }"
            >
              {{ m.label }}
            </span>
            <span
              v-if="m.status === 'current'"
              class="ml-auto text-xs text-sky-pastel/60 px-2 py-0.5 rounded-full bg-sky-pastel/10"
            >
              now
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- cta -->
    <section class="py-16 px-6">
      <div class="max-w-xl mx-auto text-center glass-panel p-10 relative overflow-hidden">
        <div class="absolute inset-0 gradient-mesh opacity-40" />
        <div class="relative z-10">
          <h2 class="text-2xl font-bold text-white mb-3">join the beta</h2>
          <p class="text-sm text-white/40 mb-6">be among the first teams to experience syntraq.</p>
          <NuxtLink to="/register">
            <UiButton variant="primary" size="lg">get started free</UiButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
