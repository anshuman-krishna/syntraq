<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const demoAccounts = [
  { label: 'admin', email: 'admin@syntraq.io', password: 'password123' },
  { label: 'manager', email: 'manager@syntraq.io', password: 'password123' },
  { label: 'operator', email: 'operator@syntraq.io', password: 'password123' },
]

function fillDemo(account: typeof demoAccounts[number]) {
  email.value = account.email
  password.value = account.password
}

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

      <div class="space-y-2">
        <p class="text-center text-xs text-white/30">demo accounts</p>
        <div class="flex gap-2">
          <button
            v-for="account in demoAccounts"
            :key="account.email"
            type="button"
            class="flex-1 px-2 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
            @click="fillDemo(account)"
          >
            {{ account.label }}
          </button>
        </div>
      </div>

      <p class="text-center text-xs text-white/25">
        don't have an account?
        <NuxtLink to="/register" class="text-sky-pastel/70 hover:text-sky-pastel transition-colors duration-200">
          register
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
