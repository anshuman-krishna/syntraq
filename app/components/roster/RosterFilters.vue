<script setup lang="ts">
import type { EmployeeRole, ShiftStatus } from '@shared/types/roster'

const roster = useRosterStore()

const roles: Array<EmployeeRole | 'all'> = ['all', 'driver', 'operator', 'mechanic', 'supervisor']
const statuses: Array<ShiftStatus | 'all'> = ['all', 'scheduled', 'active', 'completed', 'cancelled']
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <div class="relative flex-1 max-w-xs w-full">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="roster.searchQuery"
        type="text"
        placeholder="search employees..."
        class="w-full pl-9 pr-4 py-2 text-sm text-white/80 placeholder:text-white/25 bg-glass-white border border-glass-border rounded-xl outline-none focus:border-sky-pastel/30 focus:shadow-[0_0_0_3px_rgba(167,216,255,0.08)] transition-all duration-200"
      />
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <div class="flex items-center gap-1 p-1 rounded-xl bg-glass-white/50 border border-glass-border/50">
        <button
          v-for="role in roles"
          :key="role"
          class="px-2.5 py-1 rounded-lg text-xs capitalize transition-all duration-200"
          :class="roster.filterRole === role
            ? 'bg-sky-pastel/15 text-sky-pastel'
            : 'text-white/40 hover:text-white/60'
          "
          @click="roster.filterRole = role"
        >
          {{ role }}
        </button>
      </div>

      <div class="flex items-center gap-1 p-1 rounded-xl bg-glass-white/50 border border-glass-border/50">
        <button
          v-for="status in statuses"
          :key="status"
          class="px-2.5 py-1 rounded-lg text-xs capitalize transition-all duration-200"
          :class="roster.filterStatus === status
            ? 'bg-mint/15 text-mint'
            : 'text-white/40 hover:text-white/60'
          "
          @click="roster.filterStatus = status"
        >
          {{ status }}
        </button>
      </div>
    </div>
  </div>
</template>
