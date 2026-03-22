<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'pricing — syntraq',
  meta: [
    { name: 'description', content: 'simple, transparent pricing for syntraq. start free, upgrade as you grow. plans for small teams to enterprise fleets.' },
    { property: 'og:title', content: 'pricing — syntraq' },
    { property: 'og:description', content: 'start free. upgrade when you're ready. no surprises.' },
  ],
})

const plans = [
  {
    name: 'free',
    price: 0,
    description: 'for small teams getting started with digital operations',
    cta: 'get started',
    ctaVariant: 'ghost' as const,
    popular: false,
    limits: {
      users: '3 users',
      employees: '5 employees',
      shifts: '50 shifts/mo',
      workflows: '2 workflows',
    },
    features: [
      { name: 'roster management', included: true },
      { name: 'shift scheduling', included: true },
      { name: 'basic dashboard', included: true },
      { name: 'mobile access', included: true },
      { name: 'email support', included: true },
      { name: 'ai assistant', included: false },
      { name: 'session replay', included: false },
      { name: 'advanced insights', included: false },
      { name: 'audit logging', included: false },
      { name: 'api access', included: false },
    ],
  },
  {
    name: 'pro',
    price: 49,
    description: 'for growing operations teams that need real intelligence',
    cta: 'start free trial',
    ctaVariant: 'primary' as const,
    popular: true,
    limits: {
      users: '15 users',
      employees: '50 employees',
      shifts: '500 shifts/mo',
      workflows: '20 workflows',
    },
    features: [
      { name: 'roster management', included: true },
      { name: 'shift scheduling', included: true },
      { name: 'advanced dashboard', included: true },
      { name: 'mobile access', included: true },
      { name: 'priority support', included: true },
      { name: 'ai assistant', included: true },
      { name: 'session replay', included: true },
      { name: 'advanced insights', included: true },
      { name: 'audit logging', included: true },
      { name: 'api access', included: false },
    ],
  },
  {
    name: 'enterprise',
    price: 199,
    description: 'for large fleets and multi-site operations',
    cta: 'contact sales',
    ctaVariant: 'ghost' as const,
    popular: false,
    limits: {
      users: 'unlimited users',
      employees: 'unlimited employees',
      shifts: 'unlimited shifts',
      workflows: 'unlimited workflows',
    },
    features: [
      { name: 'roster management', included: true },
      { name: 'shift scheduling', included: true },
      { name: 'advanced dashboard', included: true },
      { name: 'mobile access', included: true },
      { name: 'dedicated support', included: true },
      { name: 'ai assistant', included: true },
      { name: 'session replay', included: true },
      { name: 'advanced insights', included: true },
      { name: 'audit logging', included: true },
      { name: 'api access', included: true },
    ],
  },
]

const faqs = [
  {
    q: 'can i switch plans anytime?',
    a: 'yes. upgrade or downgrade at any time from your settings. changes take effect immediately.',
  },
  {
    q: 'is there a free trial for pro?',
    a: 'yes. start with the free plan and upgrade to pro when you\'re ready. no credit card required to start.',
  },
  {
    q: 'what happens when i hit a limit?',
    a: 'you\'ll see a clear message and can upgrade instantly. we never silently block your operations.',
  },
  {
    q: 'do you offer annual billing?',
    a: 'annual billing with a 20% discount is coming soon. sign up for updates.',
  },
]
</script>

<template>
  <div class="overflow-hidden">
    <!-- hero -->
    <section class="pt-32 pb-16 px-6">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
          simple, transparent <span class="text-gradient">pricing</span>
        </h1>
        <p class="text-lg text-white/40 max-w-md mx-auto">
          start free. upgrade when you're ready. no surprises.
        </p>
      </div>
    </section>

    <!-- plans -->
    <section class="py-12 px-6">
      <div class="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="glass-card p-8 flex flex-col relative"
          :class="plan.popular ? 'ring-1 ring-sky-pastel/20' : ''"
        >
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-pastel/20 text-xs text-sky-pastel font-medium"
          >
            popular
          </div>

          <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">{{ plan.name }}</h3>

          <div class="flex items-baseline gap-1 mb-2">
            <span class="text-4xl font-bold text-white">${{ plan.price }}</span>
            <span class="text-sm text-white/30">/mo</span>
          </div>

          <p class="text-xs text-white/35 mb-6">{{ plan.description }}</p>

          <NuxtLink to="/register" class="mb-6">
            <UiButton :variant="plan.ctaVariant" size="sm" class="w-full">{{ plan.cta }}</UiButton>
          </NuxtLink>

          <!-- limits -->
          <div class="space-y-2 mb-6 pb-6 border-b border-glass-border">
            <div class="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">limits</div>
            <div v-for="(value, key) in plan.limits" :key="key" class="flex items-center gap-2 text-sm text-white/60">
              <span class="text-mint text-xs">{{ value }}</span>
            </div>
          </div>

          <!-- features -->
          <div class="space-y-2.5 flex-1">
            <div class="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">features</div>
            <div
              v-for="feature in plan.features"
              :key="feature.name"
              class="flex items-center gap-2.5 text-sm"
              :class="feature.included ? 'text-white/60' : 'text-white/20'"
            >
              <svg
                class="w-4 h-4 shrink-0"
                :class="feature.included ? 'text-mint' : 'text-white/10'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path v-if="feature.included" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 12H6" />
              </svg>
              {{ feature.name }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- faq -->
    <section class="py-24 px-6">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-white text-center mb-12">frequently asked questions</h2>

        <div class="space-y-4">
          <div v-for="faq in faqs" :key="faq.q" class="glass-card p-6">
            <h3 class="text-sm font-medium text-white/80 mb-2">{{ faq.q }}</h3>
            <p class="text-sm text-white/40 leading-relaxed">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- cta -->
    <section class="py-16 px-6">
      <div class="max-w-xl mx-auto text-center glass-panel p-10 relative overflow-hidden">
        <div class="absolute inset-0 gradient-mesh opacity-40" />
        <div class="relative z-10">
          <h2 class="text-2xl font-bold text-white mb-3">ready to get started?</h2>
          <p class="text-sm text-white/40 mb-6">no credit card required. free plan available.</p>
          <NuxtLink to="/register">
            <UiButton variant="primary" size="lg">start free trial</UiButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
