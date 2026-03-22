<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  const result = await auth.login(email.value, password.value)
  if (result.success) {
    ui.addToast({ type: 'success', message: 'welcome back' })
    router.push('/dashboard')
  } else {
    error.value = result.error ?? 'login failed'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-sm p-8 space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white">syntraq</h1>
        <p class="text-sm text-white/40 mt-1">sign in to continue</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UiInput
          v-model="email"
          label="email"
          type="email"
          autocomplete="email"
        />
        <UiInput
          v-model="password"
          label="password"
          type="password"
          autocomplete="current-password"
        />

        <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

        <UiButton
          type="submit"
          variant="primary"
          class="w-full"
          :loading="auth.loading"
        >
          sign in
        </UiButton>
      </form>

      <p class="text-center text-xs text-white/30">
        demo: admin@syntraq.io / password123
      </p>
    </div>
  </div>
</template>
