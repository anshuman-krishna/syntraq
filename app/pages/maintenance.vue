<script setup lang="ts">
const auth = useAuthStore()
const canManage = computed(() => auth.hasMinRole('manager'))

interface Vehicle {
  id: string
  name: string
  plate: string
}

interface MaintenanceRecord {
  id: string
  vehicleId: string
  vehicleName: string
  type: 'service' | 'inspection' | 'repair'
  date: string
  odometer: number | null
  cost: number | null
  status: 'scheduled' | 'in-progress' | 'completed'
  notes: string | null
}

const records = ref<MaintenanceRecord[]>([])
const vehicles = ref<Vehicle[]>([])
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)

const form = reactive({
  vehicleId: '',
  type: 'service' as MaintenanceRecord['type'],
  date: new Date().toISOString().slice(0, 10),
  odometer: '',
  cost: '',
  status: 'completed' as MaintenanceRecord['status'],
  notes: '',
})

onMounted(async () => {
  try {
    const data = await $fetch<{ records: MaintenanceRecord[]; vehicles: Vehicle[] }>('/api/maintenance')
    records.value = data.records
    vehicles.value = data.vehicles
  } catch {
    // handled by empty state
  } finally {
    loading.value = false
  }
})

const canSubmit = computed(() => form.vehicleId && form.date && !saving.value)

async function submit() {
  if (!canSubmit.value) return
  saving.value = true
  try {
    const data = await $fetch<{ record: MaintenanceRecord }>('/api/maintenance', {
      method: 'POST',
      body: {
        vehicleId: form.vehicleId,
        type: form.type,
        date: form.date,
        odometer: form.odometer ? Math.round(Number(form.odometer)) : null,
        cost: form.cost ? Math.round(Number(form.cost) * 100) : null,
        status: form.status,
        notes: form.notes || null,
      },
    })
    records.value.unshift(data.record)
    resetForm()
    showForm.value = false
  } catch {
    // surface inline by leaving the form open
  } finally {
    saving.value = false
  }
}

function resetForm() {
  form.vehicleId = ''
  form.type = 'service'
  form.date = new Date().toISOString().slice(0, 10)
  form.odometer = ''
  form.cost = ''
  form.status = 'completed'
  form.notes = ''
}

const typeColors: Record<MaintenanceRecord['type'], string> = {
  service: 'text-mint',
  inspection: 'text-sky-pastel',
  repair: 'text-peach',
}

const statusColors: Record<MaintenanceRecord['status'], string> = {
  scheduled: 'text-white/40',
  'in-progress': 'text-sky-pastel',
  completed: 'text-mint',
}

function formatCost(cents: number | null) {
  if (cents === null) return '-'
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const selectClass = 'w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-glass-border/40 text-sm text-white/80 outline-none focus:border-sky-pastel/30 transition-colors'
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white mb-1">maintenance</h1>
        <p class="text-sm text-white/40">track and schedule fleet maintenance</p>
      </div>

      <UiButton v-if="canManage" variant="primary" size="sm" @click="showForm = !showForm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        log maintenance
      </UiButton>
    </div>

    <UiCard v-if="showForm && canManage" padding="lg">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs text-white/40">vehicle</span>
          <select v-model="form.vehicleId" :class="selectClass">
            <option value="" disabled>select a vehicle</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.name }} · {{ v.plate }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs text-white/40">type</span>
          <select v-model="form.type" :class="selectClass">
            <option value="service">service</option>
            <option value="inspection">inspection</option>
            <option value="repair">repair</option>
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs text-white/40">date</span>
          <input v-model="form.date" type="date" :class="selectClass">
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs text-white/40">status</span>
          <select v-model="form.status" :class="selectClass">
            <option value="scheduled">scheduled</option>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs text-white/40">odometer (optional)</span>
          <input v-model="form.odometer" type="number" min="0" placeholder="mileage" :class="selectClass">
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs text-white/40">cost (optional)</span>
          <input v-model="form.cost" type="number" min="0" step="0.01" placeholder="0.00" :class="selectClass">
        </label>

        <label class="flex flex-col gap-1.5 sm:col-span-2">
          <span class="text-xs text-white/40">notes (optional)</span>
          <input v-model="form.notes" type="text" maxlength="500" placeholder="add details..." :class="selectClass">
        </label>
      </div>

      <div class="flex items-center justify-end gap-3 mt-5">
        <UiButton variant="ghost" size="sm" @click="showForm = false">cancel</UiButton>
        <UiButton variant="primary" size="sm" :disabled="!canSubmit" :loading="saving" @click="submit">save record</UiButton>
      </div>
    </UiCard>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-6 h-6 border-2 border-sky-pastel/30 border-t-sky-pastel rounded-full animate-spin" />
    </div>

    <div v-else-if="records.length === 0" class="glass-card p-12 text-center">
      <p class="text-white/40 text-sm">no maintenance records yet</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="record in records"
        :key="record.id"
        class="glass-card p-4 flex items-center gap-4"
      >
        <div class="w-2 h-2 rounded-full shrink-0" :class="typeColors[record.type].replace('text-', 'bg-')" />

        <div class="flex-1 min-w-0">
          <p class="text-sm text-white/80">
            <span :class="typeColors[record.type]" class="font-medium">{{ record.type }}</span>
            <span class="text-white/30 ml-2 text-xs">{{ record.vehicleName }}</span>
          </p>
          <p v-if="record.notes" class="text-xs text-white/30 mt-0.5 truncate">{{ record.notes }}</p>
        </div>

        <div class="text-right shrink-0">
          <p class="text-xs text-white/50">{{ formatCost(record.cost) }}</p>
          <p class="text-[11px] mt-0.5" :class="statusColors[record.status]">{{ record.status }}</p>
        </div>

        <p class="text-xs text-white/25 shrink-0 w-20 text-right">{{ formatDate(record.date) }}</p>
      </div>
    </div>
  </div>
</template>
