<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const token = computed(() => String(route.query.token ?? ''))
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'password must be at least 8 characters'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'passwords do not match'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    ui.addToast({ type: 'success', message: 'password updated' })
    router.push('/login')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'reset failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-sm p-8 space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white">new password</h1>
        <p class="text-sm text-white/40 mt-1">choose a strong password</p>
      </div>

      <div v-if="!token" class="text-center text-sm text-red-400/80">
        missing reset token. please request a new link.
      </div>

      <form v-else class="space-y-4" @submit.prevent="submit">
        <UiInput
          v-model="password"
          label="new password"
          type="password"
          autocomplete="new-password"
        />
        <UiInput
          v-model="confirm"
          label="confirm password"
          type="password"
          autocomplete="new-password"
        />

        <p v-if="error" class="text-xs text-red-400">{{ error }}</p>

        <UiButton type="submit" variant="primary" class="w-full" :loading="loading">
          update password
        </UiButton>
      </form>
    </div>
  </div>
</template>
