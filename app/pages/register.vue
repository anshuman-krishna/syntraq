<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const companyName = ref('')
const error = ref('')

async function handleRegister() {
  error.value = ''

  if (!companyName.value.trim()) {
    error.value = 'company name is required'
    return
  }

  const result = await auth.register(email.value, password.value, name.value, companyName.value)
  if (result.success) {
    ui.addToast({ type: 'success', message: 'account created' })
    router.push('/dashboard')
  } else {
    error.value = result.error ?? 'registration failed'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-sm p-8 space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white">syntraq</h1>
        <p class="text-sm text-white/40 mt-1">create your account</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleRegister">
        <UiInput
          v-model="companyName"
          label="company name"
          autocomplete="organization"
        />
        <UiInput
          v-model="name"
          label="your name"
          autocomplete="name"
        />
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
          autocomplete="new-password"
        />

        <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

        <UiButton
          type="submit"
          variant="primary"
          class="w-full"
          :loading="auth.loading"
        >
          create account
        </UiButton>
      </form>

      <p class="text-center text-xs text-white/25">
        already have an account?
        <NuxtLink to="/login" class="text-sky-pastel/70 hover:text-sky-pastel transition-colors duration-200">
          sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
