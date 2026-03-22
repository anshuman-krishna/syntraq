<script setup lang="ts">
const ui = useUiStore()
const router = useRouter()
const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

interface CommandItem {
  id: string
  label: string
  description: string
  icon: string
  action: () => void
  keywords: string[]
}

const commands: CommandItem[] = [
  {
    id: 'dashboard',
    label: 'go to dashboard',
    description: 'operational overview',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    action: () => router.push('/dashboard'),
    keywords: ['home', 'stats', 'overview'],
  },
  {
    id: 'roster',
    label: 'go to roster',
    description: 'manage employees and shifts',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    action: () => router.push('/roster'),
    keywords: ['employees', 'shifts', 'schedule', 'people'],
  },
  {
    id: 'dispatch',
    label: 'go to dispatch',
    description: 'manage and assign jobs',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    action: () => router.push('/dispatch'),
    keywords: ['jobs', 'assign', 'fleet'],
  },
  {
    id: 'settings',
    label: 'go to settings',
    description: 'account and preferences',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    action: () => router.push('/settings'),
    keywords: ['account', 'profile', 'preferences'],
  },
  {
    id: 'maintenance',
    label: 'go to maintenance',
    description: 'fleet maintenance tracking',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    action: () => router.push('/maintenance'),
    keywords: ['repair', 'service', 'vehicles'],
  },
  {
    id: 'billing',
    label: 'go to billing',
    description: 'invoicing and payments',
    icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
    action: () => router.push('/billing'),
    keywords: ['invoices', 'payments', 'money'],
  },
]

const filteredCommands = computed(() => {
  if (!query.value) return commands
  const q = query.value.toLowerCase()
  return commands.filter(cmd =>
    cmd.label.includes(q) ||
    cmd.description.includes(q) ||
    cmd.keywords.some(k => k.includes(q)),
  )
})

function executeCommand(cmd: CommandItem) {
  cmd.action()
  close()
}

function close() {
  ui.closeCommand()
  query.value = ''
  selectedIndex.value = 0
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredCommands.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const cmd = filteredCommands.value[selectedIndex.value]
    if (cmd) executeCommand(cmd)
  }
}

watch(query, () => {
  selectedIndex.value = 0
})

watch(() => ui.commandOpen, (open) => {
  if (open) {
    nextTick(() => inputRef.value?.focus())
  }
})

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (ui.commandOpen) close()
    else ui.openCommand()
  }
  if (e.key === 'Escape' && ui.commandOpen) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="command">
      <div v-if="ui.commandOpen" class="fixed inset-0 z-[150] flex items-start justify-center pt-[20vh]">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-xs" @click="close" />

        <div class="command-card relative w-full max-w-lg mx-4 animate-scale-in">
          <div class="flex items-center gap-3 px-5 border-b border-glass-border/50">
            <svg class="w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="type a command..."
              class="flex-1 bg-transparent py-4 text-sm text-white/90 placeholder:text-white/25 outline-none"
              @keydown="handleKeydown"
            />
            <kbd class="px-1.5 py-0.5 rounded text-[10px] text-white/20 border border-glass-border/50 font-mono">esc</kbd>
          </div>

          <div v-if="filteredCommands.length" class="p-2 max-h-72 overflow-y-auto">
            <button
              v-for="(cmd, i) in filteredCommands"
              :key="cmd.id"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
              :class="i === selectedIndex ? 'bg-glass-white text-white' : 'text-white/50 hover:bg-glass-white/50 hover:text-white/70'"
              @click="executeCommand(cmd)"
              @mouseenter="selectedIndex = i"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="cmd.icon" />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-sm">{{ cmd.label }}</p>
                <p class="text-xs text-white/30 truncate">{{ cmd.description }}</p>
              </div>
              <svg v-if="i === selectedIndex" class="w-3 h-3 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div v-else class="p-6 text-center">
            <p class="text-sm text-white/30">no results found</p>
          </div>

          <div class="px-4 py-2.5 border-t border-glass-border/50 flex items-center gap-4 text-[10px] text-white/20">
            <span><kbd class="font-mono">↑↓</kbd> navigate</span>
            <span><kbd class="font-mono">↵</kbd> select</span>
            <span><kbd class="font-mono">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.command-card {
  background: rgba(12, 16, 28, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(167, 216, 255, 0.03);
  overflow: hidden;
}

.command-enter-active,
.command-leave-active {
  transition: opacity 0.2s ease;
}

.command-enter-from,
.command-leave-to {
  opacity: 0;
}
</style>
