<script setup lang="ts">
import type { PresenceInfo } from '@shared/types/realtime'

defineProps<{
  users: PresenceInfo[]
}>()
</script>

<template>
  <Transition name="presence">
    <div
      v-if="users.length"
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-pastel/[0.06] border border-sky-pastel/[0.12]"
    >
      <div class="flex -space-x-1.5">
        <div
          v-for="user in users.slice(0, 3)"
          :key="user.userId"
          class="w-5 h-5 rounded-full bg-gradient-to-br from-sky-pastel/40 to-mint/40 border border-glass-border flex items-center justify-center"
          :title="user.userName"
        >
          <span class="text-[8px] font-medium text-white/70">
            {{ user.userName.charAt(0).toUpperCase() }}
          </span>
        </div>
      </div>
      <span class="text-[11px] text-white/40">
        <template v-if="users.length === 1">
          {{ users[0].userName }} is {{ users[0].action }}
        </template>
        <template v-else>
          {{ users.length }} users here
        </template>
      </span>
      <span class="relative flex h-1.5 w-1.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-pastel/40" />
        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-pastel/60" />
      </span>
    </div>
  </Transition>
</template>

<style scoped>
.presence-enter-active,
.presence-leave-active {
  transition: all 0.3s ease;
}

.presence-enter-from,
.presence-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
