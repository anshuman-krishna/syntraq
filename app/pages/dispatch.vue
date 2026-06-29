<script setup lang="ts">
const auth = useAuthStore()
const ui = useUiStore()
const canAssign = computed(() => auth.hasMinRole('manager'))

interface BoardShift {
  id: string
  employeeId: string
  employeeName: string
  vehicleId: string | null
  startTime: string
  endTime: string
  status: string
}

interface Assignment {
  vehicleId: string
  vehicleName: string
  vehicleStatus: string
  shifts: BoardShift[]
}

interface Board {
  date: string
  assignments: Assignment[]
  unassigned: BoardShift[]
  vehicles: Array<{ id: string; name: string; status: string }>
}

const date = ref(new Date().toISOString().slice(0, 10))
const board = ref<Board | null>(null)
const loading = ref(true)

onMounted(load)

async function load() {
  loading.value = true
  try {
    board.value = await $fetch<Board>('/api/dispatch', { query: { date: date.value } })
  } catch {
    ui.addToast({ type: 'error', message: 'failed to load dispatch board' })
  } finally {
    loading.value = false
  }
}

async function assign(shiftId: string, vehicleId: string | null) {
  try {
    await $fetch('/api/dispatch/assign', { method: 'POST', body: { shiftId, vehicleId } })
    ui.addToast({ type: 'success', message: vehicleId ? 'shift dispatched' : 'shift unassigned' })
    await load()
  } catch (e) {
    const message = e instanceof Error && 'data' in e
      ? ((e as { data?: { message?: string } }).data?.message ?? 'failed to assign vehicle')
      : 'failed to assign vehicle'
    ui.addToast({ type: 'error', message })
  }
}

const statusDot: Record<string, string> = {
  available: 'bg-mint',
  'on-route': 'bg-sky-pastel',
  maintenance: 'bg-peach-glow',
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">dispatch</h1>
        <p class="text-sm text-white/40">assign jobs to your fleet for the day</p>
      </div>
      <input
        v-model="date"
        type="date"
        class="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/80 focus:outline-none focus:border-sky-pastel/30"
        @change="load"
      >
    </div>

    <p v-if="loading" class="text-center text-sm text-white/30 py-12">loading…</p>

    <template v-else-if="board">
      <!-- unassigned queue -->
      <UiCard padding="lg">
        <h2 class="text-sm font-semibold text-white/70 mb-4">
          unassigned <span class="text-white/30">({{ board.unassigned.length }})</span>
        </h2>
        <p v-if="!board.unassigned.length" class="text-sm text-white/30 py-4">
          every shift for this day has a vehicle. nice.
        </p>
        <div v-else class="space-y-2">
          <div
            v-for="shift in board.unassigned"
            :key="shift.id"
            class="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
          >
            <div class="min-w-0">
              <p class="text-sm text-white/80 truncate">{{ shift.employeeName }}</p>
              <p class="text-[11px] text-white/30">{{ shift.startTime }}–{{ shift.endTime }}</p>
            </div>
            <select
              v-if="canAssign"
              class="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/70 focus:outline-none focus:border-sky-pastel/30"
              @change="assign(shift.id, ($event.target as HTMLSelectElement).value || null)"
            >
              <option value="">assign vehicle…</option>
              <option v-for="v in board.vehicles" :key="v.id" :value="v.id">{{ v.name }}</option>
            </select>
            <span v-else class="text-[11px] text-white/30">unassigned</span>
          </div>
        </div>
      </UiCard>

      <!-- vehicle columns -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UiCard v-for="lane in board.assignments" :key="lane.vehicleId" padding="md">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-2 h-2 rounded-full" :class="statusDot[lane.vehicleStatus] ?? 'bg-white/20'" />
            <span class="text-sm font-medium text-white/80">{{ lane.vehicleName }}</span>
            <span class="text-[11px] text-white/30 ml-auto">{{ lane.shifts.length }} shift{{ lane.shifts.length !== 1 ? 's' : '' }}</span>
          </div>

          <p v-if="!lane.shifts.length" class="text-xs text-white/25 py-3">no shifts assigned</p>
          <div v-else class="space-y-2">
            <div
              v-for="shift in lane.shifts"
              :key="shift.id"
              class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/[0.03]"
            >
              <div class="min-w-0">
                <p class="text-sm text-white/75 truncate">{{ shift.employeeName }}</p>
                <p class="text-[11px] text-white/30">{{ shift.startTime }}–{{ shift.endTime }}</p>
              </div>
              <button
                v-if="canAssign"
                class="px-2 py-1 rounded-md text-[11px] text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-all"
                @click="assign(shift.id, null)"
              >
                unassign
              </button>
            </div>
          </div>
        </UiCard>
      </div>

      <p v-if="!board.vehicles.length" class="text-center text-sm text-white/30 py-8">
        no vehicles in your fleet yet. add vehicles to start dispatching.
      </p>
    </template>
  </div>
</template>
