<script setup lang="ts">
import type { ShiftStatus } from '@shared/types/roster'

const roster = useRosterStore()

const statusColors: Record<ShiftStatus, string> = {
  scheduled: 'bg-sky-pastel/15 text-sky-pastel',
  active: 'bg-mint/15 text-mint',
  completed: 'bg-white/10 text-white/50',
  cancelled: 'bg-red-400/15 text-red-400',
}

const roleColors: Record<string, string> = {
  driver: 'text-sky-pastel',
  operator: 'text-mint',
  mechanic: 'text-peach',
  supervisor: 'text-white/70',
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-glass-border">
          <th
            class="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-white/60 transition-all duration-200 select-none"
            @click="roster.toggleSort('name')"
          >
            <div class="flex items-center gap-1.5">
              employee
              <svg
                v-if="roster.sortField === 'name'"
                class="w-3 h-3 transition-transform duration-200"
                :class="roster.sortDirection === 'desc' && 'rotate-180'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </th>
          <th
            class="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-3 px-4 cursor-pointer hover:text-white/60 transition-all duration-200 select-none"
            @click="roster.toggleSort('role')"
          >
            <div class="flex items-center gap-1.5">
              role
              <svg
                v-if="roster.sortField === 'role'"
                class="w-3 h-3 transition-transform duration-200"
                :class="roster.sortDirection === 'desc' && 'rotate-180'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </th>
          <th class="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-3 px-4">
            shift
          </th>
          <th class="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-3 px-4">
            status
          </th>
          <th class="text-right text-xs font-medium text-white/40 uppercase tracking-wider py-3 px-4" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="employee in roster.filteredEmployees"
          :key="employee.id"
          class="border-b border-glass-border/50 hover:bg-glass-white/50 transition-all duration-150 group"
        >
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-pastel/20 to-mint/20 flex items-center justify-center shrink-0">
                <span class="text-xs font-medium text-white/70">{{ employee.name.split(' ').map(n => n[0]).join('').toUpperCase() }}</span>
              </div>
              <span class="text-sm text-white/80 capitalize">{{ employee.name }}</span>
            </div>
          </td>
          <td class="py-3 px-4">
            <span class="text-sm capitalize" :class="roleColors[employee.role]">
              {{ employee.role }}
            </span>
          </td>
          <td class="py-3 px-4">
            <template v-if="roster.getLatestShift(employee.id)">
              <span class="text-sm text-white/50">
                {{ roster.getLatestShift(employee.id)!.startTime }} — {{ roster.getLatestShift(employee.id)!.endTime }}
              </span>
            </template>
            <span v-else class="text-sm text-white/25">no shift</span>
          </td>
          <td class="py-3 px-4">
            <template v-if="roster.getLatestShift(employee.id)">
              <span
                class="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                :class="statusColors[roster.getLatestShift(employee.id)!.status]"
              >
                {{ roster.getLatestShift(employee.id)!.status }}
              </span>
            </template>
          </td>
          <td class="py-3 px-4 text-right">
            <button
              v-if="roster.getLatestShift(employee.id)"
              class="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-glass-hover transition-all duration-200"
              @click="roster.openEditPanel(roster.getLatestShift(employee.id)!)"
            >
              <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
