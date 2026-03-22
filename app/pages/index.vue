<script setup lang="ts">
definePageMeta({
  layout: 'landing',
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

const capabilities = [
  'roster management',
  'pre-trip inspections',
  'billing & invoicing',
  'maintenance tracking',
  'compliance monitoring',
  'offline-first support',
]
</script>

<template>
  <div class="min-h-screen bg-mesh overflow-hidden">
    <!-- navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass-navbar">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel to-mint flex items-center justify-center">
            <span class="text-[#0a0e1a] font-bold text-sm">S</span>
          </div>
          <span class="font-semibold text-lg tracking-tight text-white/90">syntraq</span>
        </div>

        <div class="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#features" class="hover:text-white transition-base">features</a>
          <a href="#capabilities" class="hover:text-white transition-base">capabilities</a>
          <a href="#preview" class="hover:text-white transition-base">preview</a>
        </div>

        <div class="flex items-center gap-3">
          <UiButton variant="ghost" size="sm">sign in</UiButton>
          <UiButton variant="primary" size="sm">get started</UiButton>
        </div>
      </div>
    </nav>

    <!-- hero -->
    <section class="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center">
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

          <div class="flex items-center gap-4">
            <UiButton variant="primary" size="lg">start free trial</UiButton>
            <UiButton variant="secondary" size="lg">watch demo</UiButton>
          </div>
        </div>

        <!-- three.js scene -->
        <div class="relative h-[400px] lg:h-[500px] animate-fade-in" style="animation-delay: 0.2s;">
          <ClientOnly>
            <HeroScene />
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- features -->
    <section id="features" class="py-24 px-6 relative">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16 animate-fade-in">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            built for <span class="text-gradient">real operations</span>
          </h2>
          <p class="text-white/40 max-w-lg mx-auto">
            every feature is designed to solve real problems in the field — not just look good on a demo.
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
      </div>
    </section>

    <!-- capabilities -->
    <section id="capabilities" class="py-24 px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
            everything you need,<br />
            <span class="text-gradient">nothing you don't</span>
          </h2>
          <p class="text-white/40 mb-8 max-w-md leading-relaxed">
            modular by design. start with what you need, scale as you grow. every module integrates seamlessly.
          </p>

          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="cap in capabilities"
              :key="cap"
              class="flex items-center gap-3 px-4 py-3 glass-card text-sm text-white/60 hover:text-white transition-base"
            >
              <svg class="w-4 h-4 text-mint shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="capitalize">{{ cap }}</span>
            </div>
          </div>
        </div>

        <!-- product preview mock -->
        <div class="glass-panel p-2">
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-pastel/20 to-mint/20" />
                <div>
                  <div class="h-3 w-24 rounded-full bg-white/10" />
                  <div class="h-2 w-16 rounded-full bg-white/5 mt-2" />
                </div>
              </div>
              <div class="h-6 w-16 rounded-lg bg-mint/10" />
            </div>

            <div class="space-y-2">
              <div
                v-for="i in 4"
                :key="i"
                class="flex items-center gap-3 p-3 rounded-xl bg-glass-white"
              >
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel/10 to-mint/10 shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <div class="h-2.5 rounded-full bg-white/10" :style="{ width: `${60 + i * 8}%` }" />
                  <div class="h-2 rounded-full bg-white/5" :style="{ width: `${40 + i * 5}%` }" />
                </div>
                <div class="h-5 w-12 rounded-md bg-peach/10 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- cta -->
    <section id="preview" class="py-24 px-6">
      <div class="max-w-3xl mx-auto text-center">
        <div class="glass-panel p-12 relative overflow-hidden">
          <div class="absolute inset-0 gradient-mesh opacity-50" />

          <div class="relative z-10">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
              ready to modernize<br />your operations?
            </h2>
            <p class="text-white/40 mb-8 max-w-md mx-auto">
              join companies that have replaced spreadsheets and guesswork with real-time operational intelligence.
            </p>
            <div class="flex items-center justify-center gap-4">
              <UiButton variant="primary" size="lg">get started free</UiButton>
              <UiButton variant="ghost" size="lg">talk to us</UiButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- footer -->
    <footer class="py-12 px-6 border-t border-glass-border">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md bg-gradient-to-br from-sky-pastel to-mint flex items-center justify-center">
            <span class="text-[#0a0e1a] font-bold text-[10px]">S</span>
          </div>
          <span class="text-sm text-white/40">syntraq</span>
        </div>
        <p class="text-xs text-white/25">&copy; {{ new Date().getFullYear() }} syntraq. all rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
