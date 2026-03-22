<script setup lang="ts">
const profileName = ref('john doe')
const profileEmail = ref('john@company.com')
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-2xl font-bold text-white mb-1">settings</h1>
      <p class="text-sm text-white/40">manage your account and preferences</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-6">profile</h2>
          <div class="space-y-4">
            <UiInput v-model="profileName" label="name" placeholder="enter your name" />
            <UiInput v-model="profileEmail" label="email" placeholder="enter your email" type="email" />
          </div>
          <div class="mt-6 flex justify-end">
            <UiButton variant="primary" size="sm">save changes</UiButton>
          </div>
        </UiCard>

        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-6">appearance</h2>
          <div class="flex items-center justify-between p-3 rounded-xl bg-glass-white/50">
            <div>
              <p class="text-sm text-white/80">dark mode</p>
              <p class="text-xs text-white/30">enabled by default</p>
            </div>
            <div class="w-10 h-6 rounded-full bg-sky-pastel/30 flex items-center justify-end px-1">
              <div class="w-4 h-4 rounded-full bg-sky-pastel" />
            </div>
          </div>
        </UiCard>
      </div>

      <UiCard padding="lg">
        <h2 class="text-sm font-semibold text-white/70 mb-6">account</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-glass-white/50 cursor-pointer hover:bg-glass-hover transition-all duration-200">
            <svg class="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-sm text-white/60">change password</span>
          </div>
          <div class="flex items-center gap-3 p-3 rounded-xl bg-glass-white/50 cursor-pointer hover:bg-glass-hover transition-all duration-200">
            <svg class="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="text-sm text-white/60">notification settings</span>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
