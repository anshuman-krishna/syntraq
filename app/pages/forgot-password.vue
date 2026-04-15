<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const email = ref('')
const sent = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/password-reset/request', {
      method: 'POST',
      body: { email: email.value },
    })
    sent.value = true
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'request failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-sm p-8 space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white">reset password</h1>
        <p class="text-sm text-white/40 mt-1">we'll email you a reset link</p>
      </div>

      <div v-if="sent" class="text-center space-y-3">
        <p class="text-sm text-white/70">if an account exists for that email, a reset link is on the way.</p>
        <NuxtLink to="/login" class="text-sm text-sky-pastel/70 hover:text-sky-pastel transition-colors duration-200">
          back to sign in
        </NuxtLink>
      </div>

      <form v-else class="space-y-4" @submit.prevent="submit">
        <UiInput
          v-model="email"
          label="email"
          type="email"
          autocomplete="email"
        />

        <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

        <UiButton type="submit" variant="primary" class="w-full" :loading="loading">
          send reset link
        </UiButton>

        <p class="text-center text-xs text-white/25">
          remembered it?
          <NuxtLink to="/login" class="text-sky-pastel/70 hover:text-sky-pastel transition-colors duration-200">
            sign in
          </NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>
