<script setup lang="ts">
import type { ShiftStatus } from '@shared/types/roster'

const roster = useRosterStore()
const ui = useUiStore()

const hours = Array.from({ length: 18 }, (_, i) => i + 6)

const today = new Date()
const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today)
  d.setDate(d.getDate() + i - 2)
  return {
    date: d.toISOString().split('T')[0],
    label: d.toLocaleDateString('en', { weekday: 'short' }),
    day: d.getDate(),
    isToday: d.toDateString() === today.toDateString(),
  }
})

const selectedDay = ref(today.toISOString().split('T')[0])

const statusColors: Record<ShiftStatus, string> = {
  scheduled: 'from-sky-pastel/30 to-sky-pastel/10 border-sky-pastel/30',
  active: 'from-mint/30 to-mint/10 border-mint/30',
  completed: 'from-white/10 to-white/5 border-white/15',
  cancelled: 'from-red-400/20 to-red-400/5 border-red-400/20',
}

const dragging = ref<string | null>(null)
const timelineRef = ref<HTMLElement | null>(null)

function getShiftStyle(startTime: string, endTime: string) {
  const startHour = parseInt(startTime.split(':')[0])
  const endHour = parseInt(endTime.split(':')[0])
  const left = ((startHour - 6) / 18) * 100
  const width = ((endHour - startHour) / 18) * 100
  return { left: `${left}%`, width: `${width}%` }
}

function handleDragStart(e: DragEvent, shiftId: string) {
  dragging.value = shiftId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', shiftId)
  }
}

function handleDragEnd() {
  dragging.value = null
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const shiftId = e.dataTransfer?.getData('text/plain')
  if (!shiftId || !timelineRef.value) return

  const trackEl = (e.target as HTMLElement).closest('.timeline-track')
  if (!trackEl) return

  const rect = trackEl.getBoundingClientRect()
  const x = e.clientX - rect.left
  const pct = x / rect.width
  const newHour = Math.round(6 + pct * 18)
  const clampedHour = Math.max(6, Math.min(newHour, 22))

  roster.moveShift(shiftId, clampedHour)
  ui.addToast({ type: 'info', message: 'shift rescheduled' })
  dragging.value = null
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}
</script>

<template>
  <div ref="timelineRef" class="space-y-4">
    <div class="flex items-center gap-2 overflow-x-auto pb-2">
      <button
        v-for="day in weekDays"
        :key="day.date"
        class="flex flex-col items-center px-4 py-2 rounded-xl text-xs transition-all duration-200 shrink-0"
        :class="selectedDay === day.date
          ? 'bg-sky-pastel/15 text-sky-pastel border border-sky-pastel/30'
          : day.isToday
            ? 'bg-glass-white text-white/70 border border-glass-border'
            : 'text-white/40 hover:text-white/60 hover:bg-glass-white border border-transparent'
        "
        @click="selectedDay = day.date"
      >
        <span class="font-medium uppercase">{{ day.label }}</span>
        <span class="text-lg font-bold mt-0.5">{{ day.day }}</span>
      </button>
    </div>

    <div class="overflow-x-auto">
      <div class="min-w-[800px]">
        <div class="flex border-b border-glass-border/50 mb-2">
          <div class="w-36 shrink-0" />
          <div class="flex-1 flex">
            <div
              v-for="hour in hours"
              :key="hour"
              class="flex-1 text-[10px] text-white/25 text-center"
            >
              {{ String(hour).padStart(2, '0') }}:00
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <div
            v-for="employee in roster.filteredEmployees"
            :key="employee.id"
            class="flex items-center group"
          >
            <div class="w-36 shrink-0 pr-3">
              <span class="text-xs text-white/50 capitalize truncate block">{{ employee.name }}</span>
            </div>

            <div
              class="timeline-track flex-1 relative h-10 bg-glass-white/30 rounded-lg"
              @dragover="handleDragOver"
              @drop="handleDrop($event)"
            >
              <div
                v-for="shift in roster.getEmployeeShifts(employee.id).filter(s => s.date === selectedDay)"
                :key="shift.id"
                class="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r border cursor-grab active:cursor-grabbing transition-all duration-200 hover:brightness-125 flex items-center px-2"
                :class="[
                  statusColors[shift.status],
                  dragging === shift.id && 'opacity-60 scale-[1.02]',
                ]"
                :style="getShiftStyle(shift.startTime, shift.endTime)"
                draggable="true"
                @dragstart="handleDragStart($event, shift.id)"
                @dragend="handleDragEnd"
                @click="roster.openEditPanel(shift)"
              >
                <span class="text-[10px] text-white/70 truncate">
                  {{ shift.startTime }}–{{ shift.endTime }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
