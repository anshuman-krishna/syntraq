<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'syntraq - operations intelligence for field-service companies',
  meta: [
    { name: 'description', content: 'the adaptive operations platform for trucking, hydrovac, and field-service companies. roster management, smart dispatch, real-time fleet visibility, and predictive operations.' },
    { property: 'og:title', content: 'syntraq - run your fleet with clarity' },
    { property: 'og:description', content: 'the adaptive operations platform for trucking, hydrovac, and field-service companies.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'syntraq - operations intelligence platform' },
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
    description: 'maintenance forecasting, route optimization, and compliance monitoring before issues arise.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-peach/20 to-peach/5',
    glow: 'group-hover:shadow-glow-peach',
  },
]

const industries = [
  { name: 'trucking', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1' },
  { name: 'hydrovac', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { name: 'logistics', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'field services', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
]

const steps = [
  {
    n: '01',
    title: 'connect your operation',
    description: 'import crews, vehicles, and shifts in minutes. no rip-and-replace, no months of setup.',
  },
  {
    n: '02',
    title: 'run on a single source of truth',
    description: 'every shift change propagates instantly to dispatch, compliance, and the activity feed. nobody re-keys anything.',
  },
  {
    n: '03',
    title: 'get ahead of problems',
    description: 'the intelligence layer surfaces overlaps, idle time, and lapsing inspections before they cost you a day.',
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

const faqs = [
  {
    q: 'how long does it take to get started?',
    a: 'most teams are live within a day. you can import existing crews and shifts, or start fresh on the free plan with no credit card.',
  },
  {
    q: 'do my crews need to learn new software?',
    a: 'the interface teaches itself. adaptive tutorials walk people through each flow the first time, so there are no training videos and no onboarding docs to read.',
  },
  {
    q: 'does it work for my industry?',
    a: 'syntraq is built for the real world of trucking, hydrovac, logistics, and field services. the modules map to how operational work actually happens, not to a generic project board.',
  },
  {
    q: 'is my operational data secure?',
    a: 'every endpoint is validated, queries run through an orm with no raw sql, sessions are hardened, and sensitive routes are rate limited. multi-tenant isolation is enforced at the data layer.',
  },
]

const openFaq = ref<number | null>(0)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}
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
            <span class="text-white">run your fleet</span><br >
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

          <div class="flex items-center gap-3 mt-8">
            <div class="flex -space-x-2">
              <div
                v-for="(t, i) in testimonials"
                :key="t.name"
                class="w-7 h-7 rounded-full border border-[#0a0e1a] bg-gradient-to-br from-sky-pastel/40 to-mint/40 flex items-center justify-center text-[10px] font-semibold text-white/80"
                :style="{ zIndex: testimonials.length - i }"
              >
                {{ t.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <p class="text-xs text-white/30">trusted by operations teams in the field</p>
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
        <MarketingRevealOnScroll
          v-for="(stat, i) in stats"
          :key="stat.label"
          :delay="i * 80"
          class="text-center"
        >
          <div class="text-2xl lg:text-3xl font-bold text-gradient">{{ stat.value }}</div>
          <div class="text-xs text-white/35 mt-1">{{ stat.label }}</div>
        </MarketingRevealOnScroll>
      </div>
    </section>

    <!-- industries -->
    <section class="py-16 px-6">
      <div class="max-w-5xl mx-auto">
        <MarketingRevealOnScroll class="text-center mb-10">
          <p class="text-xs uppercase tracking-[0.2em] text-white/30">built for the operations that move the world</p>
        </MarketingRevealOnScroll>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MarketingRevealOnScroll
            v-for="(industry, i) in industries"
            :key="industry.name"
            :delay="i * 70"
            class="glass-card p-5 flex flex-col items-center gap-3 text-center hover-lift"
          >
            <div class="w-10 h-10 rounded-xl bg-glass-white flex items-center justify-center">
              <svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="industry.icon" />
              </svg>
            </div>
            <span class="text-sm text-white/60 capitalize">{{ industry.name }}</span>
          </MarketingRevealOnScroll>
        </div>
      </div>
    </section>

    <!-- problem to solution -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <MarketingRevealOnScroll class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            the old way is <span class="text-peach/70">broken</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            field-service operations haven't changed in decades. syntraq replaces chaos with clarity.
          </p>
        </MarketingRevealOnScroll>

        <div class="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <MarketingRevealOnScroll
            v-for="(problem, i) in problems"
            :key="problem.before"
            :delay="(i % 2) * 100"
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
          </MarketingRevealOnScroll>
        </div>
      </div>
    </section>

    <!-- product preview -->
    <section class="py-24 px-6 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-sky-pastel/[0.02] to-transparent" />

      <div class="max-w-7xl mx-auto relative z-10">
        <MarketingRevealOnScroll class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            see your operations <span class="text-gradient">come alive</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            from roster to dispatch to billing, everything in one premium interface.
          </p>
        </MarketingRevealOnScroll>

        <!-- mock dashboard preview -->
        <MarketingRevealOnScroll class="glass-panel p-2 max-w-4xl mx-auto">
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
        </MarketingRevealOnScroll>
      </div>
    </section>

    <!-- how it works -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <MarketingRevealOnScroll class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            up and running in <span class="text-gradient">three steps</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            no rip-and-replace. no six-month rollout. clarity from day one.
          </p>
        </MarketingRevealOnScroll>

        <div class="grid md:grid-cols-3 gap-6">
          <MarketingRevealOnScroll
            v-for="(step, i) in steps"
            :key="step.n"
            :delay="i * 120"
            class="glass-card p-8 hover-lift"
          >
            <div class="text-4xl font-bold text-gradient mb-4 tabular-nums">{{ step.n }}</div>
            <h3 class="text-lg font-semibold text-white/90 mb-2">{{ step.title }}</h3>
            <p class="text-sm text-white/40 leading-relaxed">{{ step.description }}</p>
          </MarketingRevealOnScroll>
        </div>
      </div>
    </section>

    <!-- feature highlights -->
    <section id="features" class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <MarketingRevealOnScroll class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            built for <span class="text-gradient">real operations</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            every feature solves real problems in the field, not just demos well.
          </p>
        </MarketingRevealOnScroll>

        <div class="grid md:grid-cols-3 gap-6">
          <MarketingRevealOnScroll
            v-for="(feature, i) in features"
            :key="feature.title"
            :delay="i * 120"
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
          </MarketingRevealOnScroll>
        </div>

        <div class="text-center mt-10">
          <NuxtLink to="/features">
            <UiButton variant="ghost" size="sm">see all features &rarr;</UiButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- testimonials -->
    <section class="py-24 px-6 relative">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-mint/[0.015] to-transparent" />

      <div class="max-w-7xl mx-auto relative z-10">
        <MarketingRevealOnScroll class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            trusted by <span class="text-gradient">operations teams</span>
          </h2>
        </MarketingRevealOnScroll>

        <div class="grid md:grid-cols-3 gap-6">
          <MarketingRevealOnScroll
            v-for="(t, i) in testimonials"
            :key="t.name"
            :delay="i * 120"
            class="glass-card p-8"
          >
            <svg class="w-8 h-8 text-sky-pastel/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
            </svg>
            <p class="text-sm text-white/60 leading-relaxed mb-6">{{ t.quote }}</p>
            <div>
              <p class="text-sm font-medium text-white/80">{{ t.name }}</p>
              <p class="text-xs text-white/30 mt-0.5">{{ t.role }}, {{ t.company }}</p>
            </div>
          </MarketingRevealOnScroll>
        </div>
      </div>
    </section>

    <!-- pricing preview -->
    <section class="py-24 px-6">
      <div class="max-w-7xl mx-auto">
        <MarketingRevealOnScroll class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            simple, transparent <span class="text-gradient">pricing</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            start free. upgrade when you're ready. no surprises.
          </p>
        </MarketingRevealOnScroll>

        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <!-- free -->
          <MarketingRevealOnScroll class="glass-card p-8">
            <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">free</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-3xl font-bold text-white">$0</span>
              <span class="text-sm text-white/30">/mo</span>
            </div>
            <p class="text-xs text-white/35 mb-6">for small teams getting started</p>
            <NuxtLink to="/register">
              <UiButton variant="ghost" size="sm" class="w-full">get started</UiButton>
            </NuxtLink>
          </MarketingRevealOnScroll>

          <!-- pro -->
          <MarketingRevealOnScroll :delay="100" class="glass-card p-8 ring-1 ring-sky-pastel/20 relative">
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
          </MarketingRevealOnScroll>

          <!-- enterprise -->
          <MarketingRevealOnScroll :delay="200" class="glass-card p-8">
            <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">enterprise</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-3xl font-bold text-white">$199</span>
              <span class="text-sm text-white/30">/mo</span>
            </div>
            <p class="text-xs text-white/35 mb-6">for large fleets and multi-site ops</p>
            <UiButton variant="ghost" size="sm" class="w-full">contact sales</UiButton>
          </MarketingRevealOnScroll>
        </div>

        <div class="text-center mt-8">
          <NuxtLink to="/pricing" class="text-sm text-white/35 hover:text-white/60 transition-base">
            compare all plans &rarr;
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- faq -->
    <section class="py-24 px-6">
      <div class="max-w-3xl mx-auto">
        <MarketingRevealOnScroll class="text-center mb-12">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            questions, <span class="text-gradient">answered</span>
          </h2>
        </MarketingRevealOnScroll>

        <div class="space-y-3">
          <MarketingRevealOnScroll
            v-for="(faq, i) in faqs"
            :key="faq.q"
            :delay="i * 60"
          >
            <button
              type="button"
              class="w-full glass-card p-5 text-left transition-base hover:bg-glass-hover"
              @click="toggleFaq(i)"
            >
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm font-medium text-white/85">{{ faq.q }}</span>
                <svg
                  class="w-4 h-4 text-white/40 shrink-0 transition-transform duration-300"
                  :class="{ 'rotate-45': openFaq === i }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <Transition name="faq">
                <p v-if="openFaq === i" class="text-sm text-white/45 leading-relaxed mt-3">{{ faq.a }}</p>
              </Transition>
            </button>
          </MarketingRevealOnScroll>
        </div>
      </div>
    </section>

    <!-- final cta -->
    <section class="py-24 px-6">
      <div class="max-w-3xl mx-auto text-center">
        <MarketingRevealOnScroll class="glass-panel p-12 relative overflow-hidden">
          <div class="absolute inset-0 gradient-mesh opacity-50" />

          <div class="relative z-10">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
              ready to modernize<br >your operations?
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
        </MarketingRevealOnScroll>
      </div>
    </section>
  </div>
</template>

<style scoped>
.faq-enter-active,
.faq-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
