<script setup lang="ts">
interface ReplaySession {
  id: string
  userId: string
  userName: string
  startedAt: string
  endedAt: string | null
  route: string
  eventCount: number
}

interface ReplayEvent {
  id: string
  type: string
  route: string
  action: string | null
  metadata: string | null
  timestamp: string
}

const auth = useAuthStore()
const router = useRouter()

const sessions = ref<ReplaySession[]>([])
const loadingSessions = ref(true)

const selectedSession = ref<ReplaySession | null>(null)
const events = ref<ReplayEvent[]>([])
const loadingEvents = ref(false)
const currentIndex = ref(0)
const playing = ref(false)
let playTimer: ReturnType<typeof setTimeout> | null = null
const playSpeed = ref(1000)

// phase 13 features
const trainingMode = ref(false)
const activeTab = ref<'playback' | 'compare' | 'score'>('playback')

const currentEvent = computed(() => events.value[currentIndex.value] ?? null)

onMounted(async () => {
  if (!auth.hasMinRole('manager')) {
    router.replace('/dashboard')
    return
  }

  try {
    const data = await $fetch<{ sessions: ReplaySession[] }>('/api/replay')
    sessions.value = data.sessions
  } catch {
    // handled by empty state
  } finally {
    loadingSessions.value = false
  }
})

async function selectSession(sessionId: string) {
  loadingEvents.value = true
  stopPlayback()
  currentIndex.value = 0
  activeTab.value = 'playback'

  try {
    const data = await $fetch<{ session: ReplaySession; events: ReplayEvent[] }>(`/api/replay/${sessionId}`)
    selectedSession.value = data.session
    events.value = data.events
  } catch {
    events.value = []
  } finally {
    loadingEvents.value = false
  }
}

function goBack() {
  stopPlayback()
  selectedSession.value = null
  events.value = []
  currentIndex.value = 0
  trainingMode.value = false
}

function startPlayback() {
  if (trainingMode.value) return
  if (currentIndex.value >= events.value.length - 1) {
    currentIndex.value = 0
  }
  playing.value = true
  stepForward()
}

function stopPlayback() {
  playing.value = false
  if (playTimer) {
    clearTimeout(playTimer)
    playTimer = null
  }
}

function stepForward() {
  if (currentIndex.value >= events.value.length - 1) {
    stopPlayback()
    return
  }

  currentIndex.value++

  if (playing.value) {
    const current = new Date(events.value[currentIndex.value]?.timestamp ?? 0).getTime()
    const next = new Date(events.value[currentIndex.value + 1]?.timestamp ?? 0).getTime()
    const gap = Math.min(Math.max(next - current, 100), 3000)
    const delay = gap / (playSpeed.value / 1000)

    playTimer = setTimeout(stepForward, delay)
  }
}

function handleStep(direction: 'forward' | 'backward') {
  stopPlayback()
  if (direction === 'forward' && currentIndex.value < events.value.length - 1) {
    currentIndex.value++
  } else if (direction === 'backward' && currentIndex.value > 0) {
    currentIndex.value--
  }
}

function handleSeek(index: number) {
  stopPlayback()
  currentIndex.value = index
}

onBeforeUnmount(() => {
  stopPlayback()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center gap-4">
      <button
        v-if="selectedSession"
        class="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-200"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div>
        <h1 class="text-2xl font-bold text-white mb-1">replay</h1>
        <p class="text-sm text-white/40">
          {{ selectedSession ? `${selectedSession.userName}'s session` : 'review recorded user sessions' }}
        </p>
      </div>

      <div class="flex-1" />

      <!-- mode tabs (when session selected) -->
      <div v-if="selectedSession" class="flex items-center p-1 rounded-xl bg-glass-white/50 border border-glass-border/50">
        <button
          v-for="tab in (['playback', 'compare', 'score'] as const)"
          :key="tab"
          class="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
          :class="activeTab === tab ? 'bg-sky-pastel/15 text-sky-pastel' : 'text-white/40 hover:text-white/60'"
          @click="activeTab = tab; if (tab !== 'playback') stopPlayback()"
        >
          {{ tab }}
        </button>
      </div>

      <div v-if="selectedSession && events.length && activeTab === 'playback'" class="flex items-center gap-2">
        <span class="text-[10px] text-white/25">speed</span>
        <select
          v-model.number="playSpeed"
          class="text-xs bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1 text-white/60 outline-none"
          @change="() => { if (playing) { stopPlayback(); startPlayback(); } }"
        >
          <option :value="2000">0.5x</option>
          <option :value="1000">1x</option>
          <option :value="500">2x</option>
          <option :value="250">4x</option>
        </select>
      </div>
    </div>

    <!-- session list -->
    <template v-if="!selectedSession">
      <ReplaySessionList
        :sessions="sessions"
        :loading="loadingSessions"
        @select="selectSession"
      />

      <!-- comparison mode (from session list) -->
      <div v-if="sessions.length >= 2" class="mt-6">
        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-4">compare sessions</h2>
          <ReplayComparison :sessions="sessions" />
        </UiCard>
      </div>
    </template>

    <!-- session detail -->
    <template v-else>
      <div v-if="loadingEvents" class="flex items-center justify-center py-20">
        <div class="w-6 h-6 border-2 border-sky-pastel/30 border-t-sky-pastel rounded-full animate-spin" />
      </div>

      <!-- playback tab -->
      <template v-else-if="activeTab === 'playback' && events.length">
        <!-- training mode toggle -->
        <ReplayTrainingMode
          :event="currentEvent"
          :enabled="trainingMode"
          @update:enabled="(v) => { trainingMode = v; if (v) stopPlayback() }"
        />

        <ReplayTimeline
          :events="events"
          :current-index="currentIndex"
          :playing="playing"
          @play="startPlayback"
          @pause="stopPlayback"
          @step="handleStep"
          @seek="handleSeek"
        />

        <!-- event list with annotations -->
        <div class="glass-card p-4 max-h-80 overflow-y-auto space-y-1">
          <div
            v-for="(evt, i) in events"
            :key="evt.id"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer"
            :class="i === currentIndex ? 'bg-sky-pastel/[0.08] border border-sky-pastel/[0.15]' : 'hover:bg-white/[0.03]'"
            @click="handleSeek(i)"
          >
            <span class="text-[10px] text-white/20 font-mono w-6 text-right shrink-0">
              {{ i + 1 }}
            </span>
            <div
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :class="{
                'bg-sky-pastel/50': evt.type === 'navigation' || evt.type === 'page_visit',
                'bg-mint/50': evt.type === 'action' || evt.type === 'click',
                'bg-peach/50': evt.type === 'hesitation',
                'bg-white/20': !['navigation', 'page_visit', 'action', 'click', 'hesitation'].includes(evt.type),
              }"
            />
            <span class="text-xs text-white/50 flex-1 truncate">
              {{ evt.action ?? evt.type }}
            </span>
            <span class="text-[10px] text-white/20 shrink-0">
              {{ evt.route }}
            </span>
          </div>
        </div>
      </template>

      <!-- compare tab -->
      <template v-else-if="activeTab === 'compare'">
        <UiCard padding="lg">
          <h2 class="text-sm font-semibold text-white/70 mb-4">session comparison</h2>
          <ReplayComparison :sessions="sessions" />
        </UiCard>
      </template>

      <!-- score tab -->
      <template v-else-if="activeTab === 'score'">
        <ReplayScorePanel :session-id="selectedSession?.id ?? null" />
      </template>

      <div v-else-if="activeTab === 'playback'" class="glass-card p-12 text-center">
        <p class="text-white/40 text-sm">no events recorded in this session</p>
      </div>
    </template>
  </div>
</template>
