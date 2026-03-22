<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

function handleClear() {
  clearError({ redirect: '/dashboard' })
}
</script>

<template>
  <div class="min-h-screen bg-mesh flex items-center justify-center px-4">
    <div class="glass-card w-full max-w-sm p-8 text-center space-y-6 animate-fade-in">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-peach/10 to-peach/5 flex items-center justify-center">
        <span class="text-3xl font-bold text-peach/50">{{ error.statusCode }}</span>
      </div>

      <div>
        <h1 class="text-xl font-bold text-white">{{ error.statusCode === 404 ? 'page not found' : 'something went wrong' }}</h1>
        <p class="text-sm text-white/40 mt-2">{{ error.message || 'an unexpected error occurred' }}</p>
      </div>

      <div class="flex gap-3 justify-center">
        <button
          class="px-4 py-2 rounded-xl text-sm text-white/60 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-all duration-200"
          @click="handleClear"
        >
          go to dashboard
        </button>
      </div>
    </div>
  </div>
</template>
