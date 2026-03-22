<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex items-center gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">team chat</h1>
        <p class="text-sm text-white/40">communicate with your team in real time</p>
      </div>
    </div>

    <UiCard padding="none" class="h-[calc(100vh-220px)] overflow-hidden">
      <ChatPanel />
    </UiCard>
  </div>
</template>
