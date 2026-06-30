<script setup lang="ts">
type Accent = 'sky' | 'mint' | 'peach'

const props = withDefaults(defineProps<{
  accent?: Accent
  variant?: number
  tag?: string
}>(), {
  accent: 'sky',
  variant: 0,
  tag: '',
})

// resolved hex per accent, used inside the svg where tailwind tokens can't reach.
const hex: Record<Accent, string> = {
  sky: '#a7d8ff',
  mint: '#b8f2e6',
  peach: '#ffd6c9',
}

const color = computed(() => hex[props.accent])
const pattern = computed(() => ((props.variant % 6) + 6) % 6)
const uid = computed(() => `bc-${props.accent}-${props.variant}`)

const gradientClass = computed(() => ({
  sky: 'from-sky-pastel/20 via-sky-pastel/5 to-transparent',
  mint: 'from-mint/20 via-mint/5 to-transparent',
  peach: 'from-peach/20 via-peach/5 to-transparent',
}[props.accent]))
</script>

<template>
  <div class="relative w-full h-full overflow-hidden bg-[#0c1120]">
    <div class="absolute inset-0 bg-gradient-to-br" :class="gradientClass" />

    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" fill="none">
      <defs>
        <radialGradient :id="`${uid}-glow`" cx="50%" cy="40%" r="70%">
          <stop offset="0%" :stop-color="color" stop-opacity="0.35" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </radialGradient>
        <linearGradient :id="`${uid}-line`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.5" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.05" />
        </linearGradient>
      </defs>

      <rect width="400" height="240" :fill="`url(#${uid}-glow)`" />

      <!-- concentric orbits -->
      <g v-if="pattern === 0" :stroke="`url(#${uid}-line)`" stroke-width="1" fill="none">
        <circle cx="200" cy="120" r="40" />
        <circle cx="200" cy="120" r="70" stroke-opacity="0.7" />
        <circle cx="200" cy="120" r="100" stroke-opacity="0.4" />
        <circle cx="270" cy="80" r="4" :fill="color" stroke="none" />
        <circle cx="120" cy="160" r="3" :fill="color" stroke="none" opacity="0.6" />
      </g>

      <!-- signal bars -->
      <g v-else-if="pattern === 1" :fill="color">
        <rect v-for="i in 14" :key="i" :x="40 + (i - 1) * 24" :y="200 - (30 + Math.abs(Math.sin(i * 0.9)) * 120)" width="10" :height="30 + Math.abs(Math.sin(i * 0.9)) * 120" rx="3" :opacity="0.2 + (i % 4) * 0.15" />
      </g>

      <!-- contour waves -->
      <g v-else-if="pattern === 2" :stroke="`url(#${uid}-line)`" stroke-width="1.5" fill="none">
        <path v-for="i in 6" :key="i" :d="`M -20 ${60 + i * 24} C 100 ${20 + i * 24}, 300 ${100 + i * 24}, 420 ${50 + i * 24}`" :stroke-opacity="0.6 - i * 0.07" />
      </g>

      <!-- node grid -->
      <g v-else-if="pattern === 3">
        <g :stroke="color" stroke-width="0.75" stroke-opacity="0.25">
          <line v-for="i in 5" :key="`h${i}`" x1="40" :y1="40 + (i - 1) * 40" x2="360" :y2="40 + (i - 1) * 40" />
          <line v-for="i in 9" :key="`v${i}`" :x1="40 + (i - 1) * 40" y1="40" :x2="40 + (i - 1) * 40" y2="200" />
        </g>
        <circle v-for="(p, i) in [[120,80],[240,120],[200,160],[280,80],[160,40]]" :key="i" :cx="p[0]" :cy="p[1]" :r="4 + (i % 3)" :fill="color" :opacity="0.5 + (i % 3) * 0.2" />
      </g>

      <!-- routed path -->
      <g v-else-if="pattern === 4">
        <path d="M 30 200 L 120 200 L 120 110 L 230 110 L 230 60 L 370 60" :stroke="`url(#${uid}-line)`" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="30" cy="200" r="6" :fill="color" />
        <circle cx="120" cy="110" r="5" :fill="color" opacity="0.7" />
        <circle cx="230" cy="60" r="5" :fill="color" opacity="0.7" />
        <circle cx="370" cy="60" r="6" :fill="color" />
      </g>

      <!-- layered hexes -->
      <g v-else :stroke="`url(#${uid}-line)`" stroke-width="1.25" fill="none">
        <polygon v-for="(s, i) in [60, 95, 130]" :key="i" :points="`${200},${120 - s} ${200 + s * 0.866},${120 - s * 0.5} ${200 + s * 0.866},${120 + s * 0.5} ${200},${120 + s} ${200 - s * 0.866},${120 + s * 0.5} ${200 - s * 0.866},${120 - s * 0.5}`" :stroke-opacity="0.7 - i * 0.2" />
      </g>
    </svg>

    <span
      v-if="tag"
      class="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium text-white/80 bg-black/20 backdrop-blur-sm border border-white/10"
    >
      {{ tag }}
    </span>
  </div>
</template>
