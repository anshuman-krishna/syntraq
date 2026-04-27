<script setup lang="ts">
const chat = useChatStore()
const route = useRoute()
const input = ref('')
const messagesEl = ref<HTMLElement | null>(null)

async function handleSend() {
  if (!input.value.trim()) return
  const msg = input.value
  input.value = ''
  await chat.send(msg, route.path)
  nextTick(() => scrollToBottom())
}

function scrollToBottom() {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

watch(() => chat.messages.length, () => {
  nextTick(() => scrollToBottom())
})
</script>

<template>
  <Transition name="chat-panel">
    <div
      v-if="chat.open"
      class="fixed bottom-20 right-6 z-50 w-80 sm:w-96 max-h-[480px] flex flex-col rounded-2xl border border-glass-border/60 bg-[#0d1225]/80 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-glass-border/40">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-mint animate-pulse" />
          <span class="text-sm font-medium text-white/70">syntraq assistant</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-glass-white transition-all"
            @click="chat.clear()"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            class="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-glass-white transition-all"
            @click="chat.toggle()"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div ref="messagesEl" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px] scrollbar-thin">
        <div
          v-if="chat.messages.length === 0"
          class="flex flex-col items-center justify-center h-full text-center py-8"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-pastel/10 to-mint/10 flex items-center justify-center mb-3">
            <svg class="w-5 h-5 text-sky-pastel/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="text-xs text-white/30">ask me anything about syntraq</p>
        </div>

        <div
          v-for="msg in chat.messages"
          :key="msg.id"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed"
            :class="msg.role === 'user'
              ? 'bg-sky-pastel/15 text-white/80 rounded-br-sm'
              : 'bg-glass-white text-white/60 rounded-bl-sm'"
          >
            {{ msg.content }}
          </div>
        </div>

        <div v-if="chat.loading" class="flex justify-start">
          <div class="bg-glass-white px-3 py-2 rounded-xl rounded-bl-sm flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style="animation-delay: 0ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style="animation-delay: 150ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>

      <form class="p-3 border-t border-glass-border/40" @submit.prevent="handleSend">
        <div class="flex gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="ask something..."
            class="flex-1 bg-glass-white rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 border border-glass-border/30 focus:border-sky-pastel/30 focus:outline-none transition-colors"
            :disabled="chat.loading"
          >
          <button
            type="submit"
            class="px-3 py-2 rounded-xl bg-sky-pastel/10 text-sky-pastel/70 hover:bg-sky-pastel/20 transition-all disabled:opacity-30"
            :disabled="!input.trim() || chat.loading"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
</style>
