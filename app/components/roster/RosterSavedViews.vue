<script setup lang="ts">
import type { EmployeeRole, ShiftStatus, SortField, SortDirection } from '@shared/types/roster'

interface ViewFilters {
  searchQuery?: string
  filterRole?: string
  filterStatus?: string
  sortField?: string
  sortDirection?: SortDirection
}
interface SavedView {
  id: string
  name: string
  filters: ViewFilters
}

const roster = useRosterStore()

const open = ref(false)
const loaded = ref(false)
const views = ref<SavedView[]>([])
const newName = ref('')
const saving = ref(false)

async function load() {
  try {
    const data = await $fetch<{ views: SavedView[] }>('/api/saved-views')
    views.value = data.views
  } catch {
    // surfaced as empty list
  } finally {
    loaded.value = true
  }
}

function toggle() {
  open.value = !open.value
  if (open.value && !loaded.value) load()
}

function apply(view: SavedView) {
  roster.searchQuery = view.filters.searchQuery ?? ''
  roster.filterRole = (view.filters.filterRole ?? 'all') as EmployeeRole | 'all'
  roster.filterStatus = (view.filters.filterStatus ?? 'all') as ShiftStatus | 'all'
  roster.sortField = (view.filters.sortField ?? 'name') as SortField
  roster.sortDirection = view.filters.sortDirection ?? 'asc'
  open.value = false
}

async function save() {
  const name = newName.value.trim()
  if (!name || saving.value) return
  saving.value = true
  try {
    const data = await $fetch<{ view: SavedView }>('/api/saved-views', {
      method: 'POST',
      body: {
        name,
        filters: {
          searchQuery: roster.searchQuery || undefined,
          filterRole: roster.filterRole,
          filterStatus: roster.filterStatus,
          sortField: roster.sortField,
          sortDirection: roster.sortDirection,
        },
      },
    })
    views.value.unshift(data.view)
    newName.value = ''
  } catch {
    // leave the name so the user can retry
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  try {
    await $fetch(`/api/saved-views/${id}`, { method: 'DELETE' })
    views.value = views.value.filter(v => v.id !== id)
  } catch {
    // no-op
  }
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-white/50 bg-glass-white/50 border border-glass-border/50 hover:text-white/70 transition-colors duration-200"
      @click="toggle"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      views
    </button>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />

    <div v-if="open" class="absolute right-0 mt-2 w-64 z-50 p-2 rounded-xl bg-[rgba(12,16,28,0.97)] border border-glass-border/60 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div v-if="!views.length && loaded" class="px-3 py-4 text-center text-xs text-white/30">
        no saved views yet
      </div>

      <button
        v-for="view in views"
        :key="view.id"
        class="group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-white/60 hover:bg-glass-white/50 hover:text-white/80 transition-colors duration-150"
        @click="apply(view)"
      >
        <span class="flex-1 text-sm truncate">{{ view.name }}</span>
        <span class="text-white/20 opacity-0 group-hover:opacity-100 hover:text-red-400/80 transition-all" @click.stop="remove(view.id)">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </button>

      <div class="flex items-center gap-2 mt-1 pt-2 border-t border-glass-border/40">
        <input
          v-model="newName"
          type="text"
          maxlength="60"
          placeholder="save current as..."
          class="flex-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-glass-border/40 text-xs text-white/70 placeholder:text-white/20 outline-none focus:border-sky-pastel/30"
          @keydown.enter="save"
        >
        <button
          class="px-2.5 py-1.5 rounded-lg text-xs text-sky-pastel bg-sky-pastel/10 border border-sky-pastel/20 hover:bg-sky-pastel/20 transition-colors disabled:opacity-40"
          :disabled="!newName.trim() || saving"
          @click="save"
        >
          save
        </button>
      </div>
    </div>
  </div>
</template>
