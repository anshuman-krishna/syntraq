<script setup lang="ts">
interface Message {
  id: string
  userId: string
  userName: string
  content: string
  channelId: string
  createdAt: string | Date
  replyTo?: string | null
}

const auth = useAuthStore()
const { onEvent } = useRealtime()

const messages = ref<Message[]>([])
const loading = ref(true)
const channel = ref('general')
const messagesContainer = ref<HTMLElement | null>(null)
const typingUsers = ref<Set<string>>(new Set())

onMounted(async () => {
  await fetchMessages()

  onEvent((event) => {
    if ((event.type as string) === 'message_created' && event.userId !== auth.user?.id) {
      const msg = event.payload.message as Message
      if (msg.channelId === channel.value) {
        messages.value.push(msg)
        scrollToBottom()
      }
    }
    if ((event.type as string) === 'typing_indicator') {
      typingUsers.value.add(event.userName)
      setTimeout(() => typingUsers.value.delete(event.userName), 3000)
    }
  })
})

async function fetchMessages() {
  loading.value = true
  try {
    const data = await $fetch<{ messages: Message[] }>(`/api/messages?channel=${channel.value}`)
    messages.value = data.messages
    nextTick(() => scrollToBottom())
  } catch {
    // silent fail
  } finally {
    loading.value = false
  }
}

async function sendMessage(content: string) {
  try {
    const data = await $fetch<{ message: Message }>('/api/messages', {
      method: 'POST',
      body: { content, channelId: channel.value },
    })
    messages.value.push(data.message)
    nextTick(() => scrollToBottom())
  } catch {
    // silent fail
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const typingLabel = computed(() => {
  const users = [...typingUsers.value]
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0]} is typing...`
  return `${users.length} people typing...`
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-glass-border/30">
      <div class="w-2 h-2 rounded-full bg-mint/50" />
      <span class="text-sm font-medium text-white/60">#{{ channel }}</span>
      <span class="text-[10px] text-white/25">team chat</span>
    </div>

    <!-- messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-3"
    >
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="w-5 h-5 border-2 border-sky-pastel/20 border-t-sky-pastel/60 rounded-full animate-spin" />
      </div>

      <div v-else-if="messages.length === 0" class="flex items-center justify-center py-8">
        <p class="text-xs text-white/25">no messages yet. start the conversation.</p>
      </div>

      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :is-own="msg.userId === auth.user?.id"
      />

      <div v-if="typingLabel" class="text-[10px] text-white/25 animate-pulse pl-10">
        {{ typingLabel }}
      </div>
    </div>

    <!-- input -->
    <ChatInput @send="sendMessage" />
  </div>
</template>
