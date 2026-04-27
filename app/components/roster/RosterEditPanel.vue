<script setup lang="ts">
import type { ShiftStatus } from '@shared/types/roster'

const roster = useRosterStore()
const ui = useUiStore()

const statuses: ShiftStatus[] = ['scheduled', 'active', 'completed', 'cancelled']

const employeeName = computed(() => {
  if (!roster.editingShift) return ''
  return roster.getEmployeeName(roster.editingShift.employeeId)
})

async function saveShift() {
  if (!roster.editingShift) return
  const success = await roster.updateShift(roster.editingShift)
  if (success) {
    ui.addToast({ type: 'success', message: 'shift updated successfully' })
  } else {
    ui.addToast({ type: 'error', message: 'failed to update shift' })
  }
}
</script>

<template>
  <Transition name="slide">
    <div
      v-if="roster.editingShift"
      class="fixed top-16 right-0 bottom-0 w-96 z-40 overflow-y-auto"
    >
      <div class="edit-panel h-full p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white/90">edit shift</h2>
          <button
            class="p-1.5 rounded-lg hover:bg-glass-hover transition-all duration-200"
            @click="roster.closeEditPanel()"
          >
            <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-3 p-3 rounded-xl bg-glass-white/50">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-pastel/20 to-mint/20 flex items-center justify-center">
            <span class="text-xs font-medium text-white/70">
              {{ employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase() }}
            </span>
          </div>
          <div>
            <p class="text-sm text-white/80 capitalize">{{ employeeName }}</p>
            <p class="text-xs text-white/40">{{ roster.editingShift.date }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <UiInput
              v-model="roster.editingShift.startTime"
              label="start"
              type="time"
            />
            <UiInput
              v-model="roster.editingShift.endTime"
              label="end"
              type="time"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs text-white/50 font-medium pl-1">status</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="status in statuses"
                :key="status"
                class="px-3 py-2 rounded-xl text-xs capitalize transition-all duration-200 border"
                :class="roster.editingShift.status === status
                  ? 'bg-sky-pastel/15 border-sky-pastel/30 text-sky-pastel'
                  : 'bg-glass-white border-glass-border text-white/50 hover:text-white/70 hover:border-white/15'
                "
                @click="roster.editingShift!.status = status"
              >
                {{ status }}
              </button>
            </div>
          </div>

          <UiInput
            v-model="roster.editingShift.notes"
            label="notes"
            placeholder="add shift notes..."
          />
        </div>

        <div class="flex gap-3 pt-2">
          <UiButton variant="secondary" size="sm" class="flex-1" :disabled="roster.saving" @click="roster.closeEditPanel()">
            cancel
          </UiButton>
          <UiButton variant="primary" size="sm" class="flex-1" :loading="roster.saving" @click="saveShift">
            save changes
          </UiButton>
        </div>

        <div class="pt-4 border-t border-glass-border/30">
          <CollaborationApprovalBadge
            entity-type="shift"
            :entity-id="roster.editingShift.id"
          />
        </div>

        <div class="pt-2">
          <CollaborationCommentThread
            entity-type="shift"
            :entity-id="roster.editingShift.id"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.edit-panel {
  background: rgba(10, 14, 26, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
