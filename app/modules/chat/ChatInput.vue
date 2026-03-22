<script setup lang="ts">
const emit = defineEmits<{
  send: [content: string]
  typing: []
}>()

const content = ref('')
let typingTimeout: ReturnType<typeof setTimeout> | null = null

function handleSend() {
  const trimmed = content.value.trim()
  if (!trimmed) return
  emit('send', trimmed)
  content.value = ''
}

function handleInput() {
  if (typingTimeout) clearTimeout(typingTimeout)
  emit('typing')
  typingTimeout = setTimeout(() => {
    // typing stopped
  }, 2000)
}
</script>

<template>
  <div class="flex gap-2 p-3 border-t border-glass-border/30">
    <input
      v-model="content"
      type="text"
      placeholder="type a message..."
      class="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-glass-border/30 text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-sky-pastel/20 transition-colors duration-200"
      @keydown.enter.prevent="handleSend"
      @input="handleInput"
    >
    <button
      class="px-3 py-2 rounded-xl bg-sky-pastel/10 text-sky-pastel hover:bg-sky-pastel/20 transition-colors duration-200"
      :class="!content.trim() ? 'opacity-30 pointer-events-none' : ''"
      @click="handleSend"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </button>
  </div>
</template>
