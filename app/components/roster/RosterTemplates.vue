<script setup lang="ts">
const auth = useAuthStore()
const roster = useRosterStore()
const canManage = computed(() => auth.hasMinRole('manager'))

interface Employee { id: string; name: string }
interface Vehicle { id: string; name: string; plate: string }
interface Template {
  id: string
  name: string
  employeeId: string
  vehicleId: string | null
  startTime: string
  endTime: string
  weekdays: number[]
}

const open = ref(false)
const loaded = ref(false)
const saving = ref(false)
const applyingId = ref<string | null>(null)

const templates = ref<Template[]>([])
const employees = ref<Employee[]>([])
const vehicles = ref<Vehicle[]>([])

const weekStart = ref(mondayOf(new Date()))

const form = reactive({
  name: '',
  employeeId: '',
  vehicleId: '',
  startTime: '08:00',
  endTime: '16:00',
  weekdays: [] as number[],
})

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function mondayOf(date: Date) {
  const d = new Date(date)
  const offset = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}

const employeeName = (id: string) => employees.value.find(e => e.id === id)?.name ?? 'unknown'

async function load() {
  try {
    const data = await $fetch<{ templates: Template[]; employees: Employee[]; vehicles: Vehicle[] }>('/api/shift-templates')
    templates.value = data.templates
    employees.value = data.employees
    vehicles.value = data.vehicles
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

function toggleDay(day: number) {
  const i = form.weekdays.indexOf(day)
  if (i === -1) form.weekdays.push(day)
  else form.weekdays.splice(i, 1)
}

const canSubmit = computed(() => form.name && form.employeeId && form.weekdays.length > 0 && !saving.value)

async function createTemplate() {
  if (!canSubmit.value) return
  saving.value = true
  try {
    const data = await $fetch<{ template: Template }>('/api/shift-templates', {
      method: 'POST',
      body: {
        name: form.name,
        employeeId: form.employeeId,
        vehicleId: form.vehicleId || null,
        startTime: form.startTime,
        endTime: form.endTime,
        weekdays: [...form.weekdays].sort(),
      },
    })
    templates.value.unshift(data.template)
    resetForm()
  } catch {
    // leave the form populated so the user can retry
  } finally {
    saving.value = false
  }
}

async function applyTemplate(id: string) {
  applyingId.value = id
  try {
    await $fetch('/api/shift-templates/apply', {
      method: 'POST',
      body: { id, weekStart: weekStart.value },
    })
    await roster.fetchAll()
  } catch {
    // no-op; roster simply isn't refreshed
  } finally {
    applyingId.value = null
  }
}

async function removeTemplate(id: string) {
  try {
    await $fetch('/api/shift-templates/remove', { method: 'POST', body: { id } })
    templates.value = templates.value.filter(t => t.id !== id)
  } catch {
    // no-op
  }
}

function resetForm() {
  form.name = ''
  form.employeeId = ''
  form.vehicleId = ''
  form.startTime = '08:00'
  form.endTime = '16:00'
  form.weekdays = []
}

const fieldClass = 'w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-glass-border/40 text-sm text-white/80 outline-none focus:border-sky-pastel/30 transition-colors'
</script>

<template>
  <UiCard v-if="canManage" padding="sm">
    <button class="w-full flex items-center justify-between px-2 py-1.5" @click="toggle">
      <span class="flex items-center gap-2 text-sm text-white/70">
        <svg class="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        shift templates
        <span v-if="loaded" class="text-xs text-white/30">({{ templates.length }})</span>
      </span>
      <svg
        class="w-4 h-4 text-white/30 transition-transform duration-200"
        :class="open && 'rotate-180'"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="open" class="px-2 pb-2 pt-3 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input v-model="form.name" type="text" maxlength="100" placeholder="template name" :class="fieldClass">
        <select v-model="form.employeeId" :class="fieldClass">
          <option value="" disabled>select employee</option>
          <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
        <select v-model="form.vehicleId" :class="fieldClass">
          <option value="">no vehicle</option>
          <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.name }} · {{ v.plate }}</option>
        </select>
        <div class="flex items-center gap-2">
          <input v-model="form.startTime" type="time" :class="fieldClass">
          <input v-model="form.endTime" type="time" :class="fieldClass">
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          v-for="(label, day) in dayLabels"
          :key="day"
          class="w-8 h-8 rounded-lg text-xs transition-all duration-200"
          :class="form.weekdays.includes(day)
            ? 'bg-sky-pastel/15 text-sky-pastel border border-sky-pastel/20'
            : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white/60'"
          @click="toggleDay(day)"
        >
          {{ label }}
        </button>

        <UiButton class="ml-auto" variant="primary" size="sm" :disabled="!canSubmit" :loading="saving" @click="createTemplate">
          save template
        </UiButton>
      </div>

      <div v-if="templates.length" class="space-y-2 pt-1">
        <div class="flex items-center gap-2 text-xs text-white/40">
          <span>apply to week of</span>
          <input v-model="weekStart" type="date" class="px-2 py-1 rounded-lg bg-white/[0.04] border border-glass-border/40 text-white/70 outline-none focus:border-sky-pastel/30">
        </div>

        <div
          v-for="template in templates"
          :key="template.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-glass-border/30"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white/80 truncate">{{ template.name }}</p>
            <p class="text-xs text-white/30">
              {{ employeeName(template.employeeId) }} · {{ template.startTime }}–{{ template.endTime }} ·
              {{ template.weekdays.map(d => dayLabels[d]).join('') }}
            </p>
          </div>

          <UiButton variant="secondary" size="sm" :loading="applyingId === template.id" @click="applyTemplate(template.id)">
            apply
          </UiButton>
          <button class="text-white/25 hover:text-red-400/80 transition-colors" @click="removeTemplate(template.id)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </UiCard>
</template>
