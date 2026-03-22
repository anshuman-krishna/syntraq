<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useHead({
  title: 'subscription confirmed — syntraq',
})

const route = useRoute()
const sessionId = route.query.session_id as string | undefined
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-6 pt-16">
    <div class="glass-card w-full max-w-md p-10 text-center space-y-6 animate-fade-in">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-mint/15 to-mint/5 flex items-center justify-center">
        <svg class="w-8 h-8 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h1 class="text-2xl font-bold text-white mb-2">you're all set</h1>
        <p class="text-sm text-white/40 leading-relaxed">
          your subscription has been confirmed. your team now has access to all upgraded features.
        </p>
      </div>

      <NuxtLink to="/dashboard">
        <UiButton variant="primary" size="lg" class="w-full">go to dashboard</UiButton>
      </NuxtLink>

      <p v-if="sessionId" class="text-[10px] text-white/15">session: {{ sessionId }}</p>
    </div>
  </div>
</template>
