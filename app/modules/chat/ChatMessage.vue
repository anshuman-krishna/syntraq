<script setup lang="ts">
interface Message {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string | Date
  replyTo?: string | null
}

defineProps<{
  message: Message
  isOwn: boolean
}>()

function formatTime(ts: string | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <div
    class="flex gap-2.5 group"
    :class="isOwn ? 'flex-row-reverse' : ''"
  >
    <div
      class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-medium"
      :class="isOwn
        ? 'bg-gradient-to-br from-sky-pastel/20 to-mint/20 text-sky-pastel/70'
        : 'bg-gradient-to-br from-white/[0.06] to-white/[0.02] text-white/40'
      "
    >
      {{ initials(message.userName) }}
    </div>

    <div
      class="max-w-[75%] px-3 py-2 rounded-2xl"
      :class="isOwn
        ? 'bg-sky-pastel/[0.08] border border-sky-pastel/[0.12] rounded-tr-md'
        : 'bg-white/[0.04] border border-glass-border/30 rounded-tl-md'
      "
    >
      <div class="flex items-center gap-2 mb-0.5">
        <span class="text-[10px] font-medium" :class="isOwn ? 'text-sky-pastel/60' : 'text-white/40'">
          {{ message.userName }}
        </span>
        <span class="text-[9px] text-white/20">{{ formatTime(message.createdAt) }}</span>
      </div>
      <p class="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
    </div>
  </div>
</template>
