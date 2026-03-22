import type { Employee, Shift, ShiftStatus, EmployeeRole, SortField, SortDirection } from '@shared/types/roster'

export const useRosterStore = defineStore('roster', () => {
  const employees = ref<Employee[]>([])
  const shifts = ref<Shift[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const initialized = ref(false)

  const searchQuery = ref('')
  const filterRole = ref<EmployeeRole | 'all'>('all')
  const filterStatus = ref<ShiftStatus | 'all'>('all')
  const sortField = ref<SortField>('name')
  const sortDirection = ref<SortDirection>('asc')
  const editingShift = ref<Shift | null>(null)

  const filteredEmployees = computed(() => {
    let result = employees.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(e => e.name.toLowerCase().includes(q))
    }

    if (filterRole.value !== 'all') {
      result = result.filter(e => e.role === filterRole.value)
    }

    return [...result].sort((a, b) => {
      let cmp = 0
      if (sortField.value === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortField.value === 'role') cmp = a.role.localeCompare(b.role)
      return sortDirection.value === 'asc' ? cmp : -cmp
    })
  })

  const activeShiftCount = computed(() =>
    shifts.value.filter(s => s.status === 'active').length,
  )

  const scheduledShiftCount = computed(() =>
    shifts.value.filter(s => s.status === 'scheduled').length,
  )

  async function fetchAll() {
    if (loading.value) return
    loading.value = true
    try {
      const data = await $fetch<{ employees: Employee[]; shifts: Shift[] }>('/api/roster')
      const empData = data.employees
      const shiftData = data.shifts
      employees.value = empData
      shifts.value = shiftData
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  function getEmployeeShifts(employeeId: string): Shift[] {
    let result = shifts.value.filter(s => s.employeeId === employeeId)
    if (filterStatus.value !== 'all') {
      result = result.filter(s => s.status === filterStatus.value)
    }
    return result.sort((a, b) => a.date.localeCompare(b.date))
  }

  function getLatestShift(employeeId: string): Shift | undefined {
    const empShifts = shifts.value.filter(s => s.employeeId === employeeId)
    return empShifts.sort((a, b) => b.date.localeCompare(a.date))[0]
  }

  function getEmployeeName(employeeId: string): string {
    return employees.value.find(e => e.id === employeeId)?.name ?? ''
  }

  function toggleSort(field: SortField) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  async function updateShift(updated: Shift): Promise<boolean> {
    saving.value = true
    try {
      const data = await $fetch<{ shift: Shift }>('/api/roster/shifts', {
        method: 'PUT',
        body: updated,
      })
      const idx = shifts.value.findIndex(s => s.id === data.shift.id)
      if (idx !== -1) shifts.value[idx] = data.shift
      editingShift.value = null
      return true
    } catch {
      return false
    } finally {
      saving.value = false
    }
  }

  function moveShift(shiftId: string, newStartHour: number) {
    const shift = shifts.value.find(s => s.id === shiftId)
    if (!shift) return

    const oldStart = parseInt(shift.startTime.split(':')[0])
    const oldEnd = parseInt(shift.endTime.split(':')[0])
    const duration = oldEnd - oldStart

    shift.startTime = `${String(newStartHour).padStart(2, '0')}:00`
    shift.endTime = `${String(Math.min(newStartHour + duration, 23)).padStart(2, '0')}:00`
  }

  function openEditPanel(shift: Shift) {
    editingShift.value = { ...shift }
  }

  function closeEditPanel() {
    editingShift.value = null
  }

  return {
    employees,
    shifts,
    loading,
    saving,
    initialized,
    searchQuery,
    filterRole,
    filterStatus,
    sortField,
    sortDirection,
    editingShift,
    filteredEmployees,
    activeShiftCount,
    scheduledShiftCount,
    fetchAll,
    getEmployeeShifts,
    getLatestShift,
    getEmployeeName,
    toggleSort,
    updateShift,
    moveShift,
    openEditPanel,
    closeEditPanel,
  }
})
