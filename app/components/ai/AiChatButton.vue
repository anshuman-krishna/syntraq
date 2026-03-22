<script setup lang="ts">
const chat = useChatStore()
</script>

<template>
  <button
    class="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center border border-glass-border/60 bg-[#0d1225]/80 backdrop-blur-xl shadow-lg shadow-black/20 text-sky-pastel/70 hover:text-sky-pastel hover:border-sky-pastel/30 hover:shadow-sky-pastel/10 hover:shadow-xl transition-all duration-200 group"
    @click="chat.toggle()"
  >
    <svg
      v-if="!chat.open"
      class="w-5 h-5 group-hover:scale-110 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    <svg
      v-else
      class="w-5 h-5 group-hover:scale-110 transition-transform"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</template>
