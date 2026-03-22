<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'syntraq — operations intelligence for field-service companies',
  meta: [
    { name: 'description', content: 'the adaptive operations platform for trucking, hydrovac, and field-service companies. roster management, smart dispatch, real-time fleet visibility, and predictive operations.' },
    { property: 'og:title', content: 'syntraq — run your fleet with clarity' },
    { property: 'og:description', content: 'the adaptive operations platform for trucking, hydrovac, and field-service companies.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'syntraq — operations intelligence platform' },
    { name: 'twitter:description', content: 'roster management, smart dispatch, real-time fleet visibility, and predictive operations.' },
  ],
})

const features = [
  {
    title: 'fleet visibility',
    description: 'real-time tracking and 3d visualization of your entire fleet across all operations.',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    color: 'from-sky-pastel/20 to-sky-pastel/5',
    glow: 'group-hover:shadow-glow',
  },
  {
    title: 'smart dispatch',
    description: 'intelligent scheduling that adapts to crew availability, location, and priority in real time.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'from-mint/20 to-mint/5',
    glow: 'group-hover:shadow-glow-mint',
  },
  {
    title: 'predictive ops',
    description: 'maintenance forecasting, route optimization, and compliance monitoring — before issues arise.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-peach/20 to-peach/5',
    glow: 'group-hover:shadow-glow-peach',
  },
]

const problems = [
  { before: 'spreadsheets and whiteboards', after: 'real-time digital roster' },
  { before: 'radio calls and guessing', after: 'live fleet map and status' },
  { before: 'missed inspections, fines', after: 'automated compliance alerts' },
  { before: 'billing errors and delays', after: 'instant invoicing from shift data' },
]

const testimonials = [
  {
    quote: 'we cut scheduling time by 60% in the first month. the team actually enjoys using it.',
    name: 'sarah mitchell',
    role: 'operations manager',
    company: 'westfield logistics',
  },
  {
    quote: 'finally a platform that understands how trucking actually works. not another generic tool.',
    name: 'marcus cole',
    role: 'fleet director',
    company: 'northern hydrovac',
  },
  {
    quote: 'the real-time visibility alone paid for itself. we stopped losing hours to status calls.',
    name: 'priya sharma',
    role: 'dispatch lead',
    company: 'apex field services',
  },
]

const stats = [
  { value: '60%', label: 'faster scheduling' },
  { value: '3x', label: 'fleet visibility' },
  { value: '45%', label: 'fewer billing errors' },
  { value: '99.9%', label: 'uptime' },
]
</script>

<template>
  <div class="overflow-hidden">
    <!-- hero -->
    <section class="relative pt-32 pb-24 px-6 min-h-[90vh] flex items-center">
      <!-- background gradient orbs -->
      <div class="absolute top-20 left-1/4 w-96 h-96 bg-sky-pastel/8 rounded-full blur-3xl animate-float" />
      <div class="absolute bottom-20 right-1/4 w-80 h-80 bg-mint/6 rounded-full blur-3xl animate-float" style="animation-delay: -3s;" />
      <div class="absolute top-1/2 right-1/3 w-64 h-64 bg-peach/5 rounded-full blur-3xl animate-float" style="animation-delay: -1.5s;" />

      <div class="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div class="animate-fade-in">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white/50 border border-glass-border bg-glass-white mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            operations intelligence platform
          </div>

          <h1 class="text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span class="text-white">run your fleet</span><br />
            <span class="text-gradient">with clarity</span>
          </h1>

          <p class="text-lg text-white/40 max-w-md mb-8 leading-relaxed">
            the adaptive operations platform for trucking, hydrovac, and field-service companies. built for speed, designed for humans.
          </p>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <NuxtLink to="/register">
              <UiButton variant="primary" size="lg">start free trial</UiButton>
            </NuxtLink>
            <NuxtLink to="/features">
              <UiButton variant="secondary" size="lg">explore features</UiButton>
            </NuxtLink>
          </div>

          <p class="text-xs text-white/25 mt-4">no credit card required. free plan available.</p>
        </div>

        <!-- three.js hero scene -->
        <div class="relative h-[400px] lg:h-[500px] animate-fade-in" style="animation-delay: 0.2s;">
          <ClientOnly>
            <HeroScene />
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- social proof stats -->
    <section class="py-12 px-6 border-y border-glass-border">
      <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <div class="text-2xl lg:text-3xl font-bold text-gradient">{{ stat.value }}</div>
          <div class="text-xs text-white/35 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- problem → solution -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            the old way is <span class="text-peach/70">broken</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            field-service operations haven't changed in decades. syntraq replaces chaos with clarity.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <div
            v-for="problem in problems"
            :key="problem.before"
            class="glass-card p-5 flex items-center gap-4 group hover-lift"
          >
            <div class="shrink-0 flex flex-col items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-peach/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-peach/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div class="w-px h-4 bg-glass-border" />
              <div class="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-mint/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div class="min-w-0">
              <p class="text-sm text-white/30 line-through decoration-white/10">{{ problem.before }}</p>
              <p class="text-sm text-white/80 mt-1.5 font-medium">{{ problem.after }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- product preview -->
    <section class="py-24 px-6 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-sky-pastel/[0.02] to-transparent" />

      <div class="max-w-7xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            see your operations <span class="text-gradient">come alive</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            from roster to dispatch to billing — everything in one premium interface.
          </p>
        </div>

        <!-- mock dashboard preview -->
        <div class="glass-panel p-2 max-w-4xl mx-auto">
          <div class="glass-card overflow-hidden">
            <!-- mock topbar -->
            <div class="flex items-center gap-3 px-5 py-3 border-b border-glass-border">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-peach/30" />
                <div class="w-2.5 h-2.5 rounded-full bg-mint/30" />
                <div class="w-2.5 h-2.5 rounded-full bg-sky-pastel/30" />
              </div>
              <div class="h-5 w-48 rounded-md bg-white/5" />
            </div>

            <!-- mock content -->
            <div class="p-6 grid grid-cols-12 gap-4">
              <!-- sidebar mock -->
              <div class="col-span-2 space-y-2.5 hidden md:block">
                <div v-for="i in 6" :key="i" class="h-7 rounded-lg" :class="i === 1 ? 'bg-sky-pastel/10' : 'bg-white/[0.03]'" />
              </div>

              <!-- main content mock -->
              <div class="col-span-12 md:col-span-10 space-y-4">
                <!-- stat cards -->
                <div class="grid grid-cols-4 gap-3">
                  <div v-for="i in 4" :key="i" class="p-3 rounded-xl bg-glass-white">
                    <div class="h-2 w-12 rounded-full bg-white/10 mb-2" />
                    <div class="h-5 w-8 rounded bg-white/[0.06]" />
                  </div>
                </div>

                <!-- chart area -->
                <div class="p-4 rounded-xl bg-glass-white">
                  <div class="h-2 w-20 rounded-full bg-white/10 mb-4" />
                  <div class="flex items-end gap-1.5 h-24">
                    <div
                      v-for="i in 12"
                      :key="i"
                      class="flex-1 rounded-t bg-gradient-to-t from-sky-pastel/20 to-sky-pastel/5"
                      :style="{ height: `${30 + Math.sin(i * 0.8) * 25 + 20}%` }"
                    />
                  </div>
                </div>

                <!-- table rows -->
                <div class="space-y-1.5">
                  <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 rounded-xl bg-glass-white">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel/10 to-mint/10 shrink-0" />
                    <div class="flex-1 space-y-1.5">
                      <div class="h-2.5 rounded-full bg-white/10" :style="{ width: `${50 + i * 12}%` }" />
                      <div class="h-2 rounded-full bg-white/5" :style="{ width: `${30 + i * 8}%` }" />
                    </div>
                    <div class="h-5 w-16 rounded-md shrink-0" :class="i === 1 ? 'bg-mint/10' : i === 2 ? 'bg-sky-pastel/10' : 'bg-peach/10'" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- feature highlights -->
    <section id="features" class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            built for <span class="text-gradient">real operations</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            every feature solves real problems in the field — not just demos well.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="glass-card p-8 group hover-lift"
          >
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-5 transition-base"
              :class="[feature.color, feature.glow]"
            >
              <svg class="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="feature.icon" />
              </svg>
            </div>

            <h3 class="text-lg font-semibold text-white/90 mb-2 capitalize">{{ feature.title }}</h3>
            <p class="text-sm text-white/40 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>

        <div class="text-center mt-10">
          <NuxtLink to="/features">
            <UiButton variant="ghost" size="sm">see all features →</UiButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- testimonials -->
    <section class="py-24 px-6 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-mint/[0.015] to-transparent" />

      <div class="max-w-7xl mx-auto relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            trusted by <span class="text-gradient">operations teams</span>
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="t in testimonials" :key="t.name" class="glass-card p-8">
            <svg class="w-8 h-8 text-sky-pastel/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
            </svg>
            <p class="text-sm text-white/60 leading-relaxed mb-6">{{ t.quote }}</p>
            <div>
              <p class="text-sm font-medium text-white/80">{{ t.name }}</p>
              <p class="text-xs text-white/30 mt-0.5">{{ t.role }}, {{ t.company }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- pricing preview -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            simple, transparent <span class="text-gradient">pricing</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            start free. upgrade when you're ready. no surprises.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <!-- free -->
          <div class="glass-card p-8">
            <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">free</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-3xl font-bold text-white">$0</span>
              <span class="text-sm text-white/30">/mo</span>
            </div>
            <p class="text-xs text-white/35 mb-6">for small teams getting started</p>
            <NuxtLink to="/register">
              <UiButton variant="ghost" size="sm" class="w-full">get started</UiButton>
            </NuxtLink>
          </div>

          <!-- pro -->
          <div class="glass-card p-8 ring-1 ring-sky-pastel/20 relative">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-pastel/20 text-xs text-sky-pastel font-medium">
              popular
            </div>
            <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">pro</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-3xl font-bold text-white">$49</span>
              <span class="text-sm text-white/30">/mo</span>
            </div>
            <p class="text-xs text-white/35 mb-6">for growing operations teams</p>
            <NuxtLink to="/register">
              <UiButton variant="primary" size="sm" class="w-full">start free trial</UiButton>
            </NuxtLink>
          </div>

          <!-- enterprise -->
          <div class="glass-card p-8">
            <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">enterprise</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-3xl font-bold text-white">$199</span>
              <span class="text-sm text-white/30">/mo</span>
            </div>
            <p class="text-xs text-white/35 mb-6">for large fleets and multi-site ops</p>
            <UiButton variant="ghost" size="sm" class="w-full">contact sales</UiButton>
          </div>
        </div>

        <div class="text-center mt-8">
          <NuxtLink to="/pricing" class="text-sm text-white/35 hover:text-white/60 transition-base">
            compare all plans →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- final cta -->
    <section class="py-24 px-6">
      <div class="max-w-3xl mx-auto text-center">
        <div class="glass-panel p-12 relative overflow-hidden">
          <div class="absolute inset-0 gradient-mesh opacity-50" />

          <div class="relative z-10">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
              ready to modernize<br />your operations?
            </h2>
            <p class="text-white/40 mb-8 max-w-md mx-auto">
              join companies that replaced spreadsheets and guesswork with real-time operational intelligence.
            </p>
            <div class="flex items-center justify-center gap-4">
              <NuxtLink to="/register">
                <UiButton variant="primary" size="lg">get started free</UiButton>
              </NuxtLink>
              <NuxtLink to="/about">
                <UiButton variant="ghost" size="lg">learn more</UiButton>
              </NuxtLink>
            </div>
            <p class="text-xs text-white/20 mt-4">free plan available. no credit card needed.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
