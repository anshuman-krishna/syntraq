import type { ChatMessage } from '@shared/types/ai'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const open = ref(false)
  const loading = ref(false)

  function toggle() {
    open.value = !open.value
  }

  async function send(content: string, route: string) {
    if (!content.trim() || loading.value) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    messages.value.push(userMessage)
    loading.value = true

    try {
      const module = route.replace(/^\//, '').split('/')[0] || undefined
      const data = await $fetch<{ message: ChatMessage }>('/api/ai/chat', {
        method: 'POST',
        body: {
          message: content.trim(),
          context: { route, module },
        },
      })
      messages.value.push(data.message)
    } catch {
      messages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'sorry, something went wrong. please try again.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      loading.value = false
    }
  }

  function clear() {
    messages.value = []
  }

  return { messages, open, loading, toggle, send, clear }
})
