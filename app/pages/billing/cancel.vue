<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'checkout cancelled — syntraq',
})
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-6 pt-16">
    <div class="glass-card w-full max-w-md p-10 text-center space-y-6 animate-fade-in">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-peach/10 to-peach/5 flex items-center justify-center">
        <svg class="w-8 h-8 text-peach/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <div>
        <h1 class="text-2xl font-bold text-white mb-2">checkout cancelled</h1>
        <p class="text-sm text-white/40 leading-relaxed">
          no worries — you can upgrade anytime from your settings. your current plan remains active.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <NuxtLink to="/settings">
          <UiButton variant="primary" size="lg" class="w-full">back to settings</UiButton>
        </NuxtLink>
        <NuxtLink to="/pricing">
          <UiButton variant="ghost" size="sm" class="w-full">compare plans</UiButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
