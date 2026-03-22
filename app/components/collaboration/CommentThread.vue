<script setup lang="ts">
interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  resolved: boolean
  createdAt: string | Date
}

const props = defineProps<{
  entityType: string
  entityId: string
}>()

const auth = useAuthStore()
const comments = ref<Comment[]>([])
const loading = ref(true)
const newComment = ref('')
const sending = ref(false)

onMounted(async () => {
  try {
    const data = await $fetch<{ comments: Comment[] }>(
      `/api/comments?entityType=${props.entityType}&entityId=${props.entityId}`
    )
    comments.value = data.comments
  } catch {
    // silent fail
  } finally {
    loading.value = false
  }
})

async function addComment() {
  const content = newComment.value.trim()
  if (!content || sending.value) return

  sending.value = true
  try {
    const data = await $fetch<{ comment: Comment }>('/api/comments', {
      method: 'POST',
      body: {
        entityType: props.entityType,
        entityId: props.entityId,
        content,
      },
    })
    comments.value.push(data.comment)
    newComment.value = ''
  } catch {
    // silent fail
  } finally {
    sending.value = false
  }
}

async function resolve(id: string) {
  try {
    await $fetch('/api/comments/resolve', {
      method: 'POST',
      body: { id },
    })
    const idx = comments.value.findIndex(c => c.id === id)
    if (idx >= 0) comments.value[idx].resolved = true
  } catch {
    // silent fail
  }
}

function formatTime(ts: string | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <svg class="w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span class="text-xs text-white/40">comments</span>
      <span v-if="comments.length" class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30">
        {{ comments.length }}
      </span>
    </div>

    <div v-if="loading" class="py-2">
      <div class="w-4 h-4 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex items-start gap-2 p-2 rounded-lg"
        :class="comment.resolved ? 'bg-white/[0.01] opacity-50' : 'bg-white/[0.03]'"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-medium text-white/50">{{ comment.userName }}</span>
            <span class="text-[9px] text-white/20">{{ formatTime(comment.createdAt) }}</span>
            <span v-if="comment.resolved" class="text-[9px] text-mint/40">resolved</span>
          </div>
          <p class="text-xs text-white/50 mt-0.5">{{ comment.content }}</p>
        </div>
        <button
          v-if="!comment.resolved && auth.hasMinRole('manager')"
          class="p-1 rounded hover:bg-white/[0.06] text-white/20 hover:text-mint/50 transition-colors duration-150 shrink-0"
          title="resolve"
          @click="resolve(comment.id)"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex gap-2">
      <input
        v-model="newComment"
        type="text"
        placeholder="add a comment..."
        class="flex-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-glass-border/30 text-xs text-white/60 placeholder:text-white/15 outline-none focus:border-sky-pastel/20 transition-colors duration-200"
        @keydown.enter.prevent="addComment"
      >
      <button
        class="px-2.5 py-1.5 rounded-lg text-[10px] bg-sky-pastel/10 text-sky-pastel/60 hover:bg-sky-pastel/20 transition-colors duration-200"
        :disabled="!newComment.trim() || sending"
        @click="addComment"
      >
        post
      </button>
    </div>
  </div>
</template>
