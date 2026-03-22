<script setup lang="ts">
import type { Workflow } from '@shared/types/workflow'

defineProps<{
  workflows: Workflow[]
  loading: boolean
}>()

const emit = defineEmits<{
  activate: [id: string]
  archive: [id: string]
  remove: [id: string]
}>()

const statusColors: Record<string, string> = {
  draft: 'text-white/40 bg-white/5',
  active: 'text-mint bg-mint/10',
  archived: 'text-peach/60 bg-peach/10',
}
</script>

<template>
  <div class="space-y-3">
    <template v-if="loading">
      <UiSkeleton v-for="i in 3" :key="i" variant="card" />
    </template>

    <template v-else-if="workflows.length">
      <UiCard
        v-for="wf in workflows"
        :key="wf.id"
        hoverable
        padding="md"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-medium text-white/80 truncate">{{ wf.name }}</h3>
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize"
                :class="statusColors[wf.status]"
              >
                {{ wf.status }}
              </span>
            </div>
            <p v-if="wf.description" class="text-xs text-white/30 mb-2 line-clamp-1">{{ wf.description }}</p>
            <p class="text-[10px] text-white/20">{{ wf.steps.length }} steps</p>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button
              v-if="wf.status === 'draft'"
              class="p-1.5 rounded-lg text-white/20 hover:text-mint hover:bg-mint/10 transition-all"
              title="activate"
              @click="emit('activate', wf.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              v-if="wf.status === 'active'"
              class="p-1.5 rounded-lg text-white/20 hover:text-peach hover:bg-peach/10 transition-all"
              title="archive"
              @click="emit('archive', wf.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            <button
              class="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="delete"
              @click="emit('remove', wf.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </UiCard>
    </template>

    <div v-else class="text-center py-12">
      <p class="text-sm text-white/30">no workflows yet</p>
      <p class="text-xs text-white/15 mt-1">create your first workflow to get started</p>
    </div>
  </div>
</template>
