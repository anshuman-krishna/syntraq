import type { Employee, Shift, Vehicle, ActivityEvent, ShiftStatus } from '@shared/types/roster'

function delay(min = 200, max = 600): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min)) + min
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

const employees: Employee[] = [
  { id: 'emp-1', name: 'marcus johnson', role: 'driver', email: 'marcus@syntraq.io', phone: '(403) 555-0101', hireDate: '2023-06-15' },
  { id: 'emp-2', name: 'sarah chen', role: 'operator', email: 'sarah@syntraq.io', phone: '(403) 555-0102', hireDate: '2023-01-20' },
  { id: 'emp-3', name: 'david williams', role: 'driver', email: 'david@syntraq.io', phone: '(403) 555-0103', hireDate: '2024-03-10' },
  { id: 'emp-4', name: 'elena rodriguez', role: 'mechanic', email: 'elena@syntraq.io', phone: '(403) 555-0104', hireDate: '2022-11-05' },
  { id: 'emp-5', name: 'james parker', role: 'supervisor', email: 'james@syntraq.io', phone: '(403) 555-0105', hireDate: '2022-04-18' },
  { id: 'emp-6', name: 'aisha patel', role: 'driver', email: 'aisha@syntraq.io', phone: '(403) 555-0106', hireDate: '2024-01-08' },
  { id: 'emp-7', name: 'ryan kim', role: 'operator', email: 'ryan@syntraq.io', phone: '(403) 555-0107', hireDate: '2023-09-22' },
  { id: 'emp-8', name: 'lisa nguyen', role: 'mechanic', email: 'lisa@syntraq.io', phone: '(403) 555-0108', hireDate: '2023-07-14' },
  { id: 'emp-9', name: 'tom bradley', role: 'driver', email: 'tom@syntraq.io', phone: '(403) 555-0109', hireDate: '2024-05-01' },
  { id: 'emp-10', name: 'maya foster', role: 'supervisor', email: 'maya@syntraq.io', phone: '(403) 555-0110', hireDate: '2022-08-30' },
]

const vehicles: Vehicle[] = [
  { id: 'veh-1', name: 'unit 101', plate: 'AB-3421', type: 'truck', status: 'on-route', mileage: 142300 },
  { id: 'veh-2', name: 'unit 102', plate: 'AB-3422', type: 'truck', status: 'available', mileage: 98500 },
  { id: 'veh-3', name: 'unit 201', plate: 'AB-5601', type: 'hydrovac', status: 'on-route', mileage: 67200 },
  { id: 'veh-4', name: 'unit 202', plate: 'AB-5602', type: 'hydrovac', status: 'maintenance', mileage: 115800 },
  { id: 'veh-5', name: 'unit 301', plate: 'AB-7801', type: 'service', status: 'available', mileage: 45600 },
  { id: 'veh-6', name: 'unit 103', plate: 'AB-3423', type: 'truck', status: 'available', mileage: 78900 },
  { id: 'veh-7', name: 'unit 203', plate: 'AB-5603', type: 'hydrovac', status: 'on-route', mileage: 89100 },
  { id: 'veh-8', name: 'unit 302', plate: 'AB-7802', type: 'service', status: 'on-route', mileage: 32400 },
]

function generateShifts(): Shift[] {
  const shifts: Shift[] = []
  const today = new Date()
  const vehicleIds = vehicles.map(v => v.id)

  employees.forEach((emp) => {
    for (let d = -3; d <= 5; d++) {
      if (Math.random() > 0.65) continue
      const date = new Date(today)
      date.setDate(date.getDate() + d)
      const startHour = 6 + Math.floor(Math.random() * 8)
      const duration = 6 + Math.floor(Math.random() * 6)

      let status: ShiftStatus
      if (d < -1) status = 'completed'
      else if (d === -1) status = Math.random() > 0.2 ? 'completed' : 'cancelled'
      else if (d === 0) status = Math.random() > 0.3 ? 'active' : 'completed'
      else status = Math.random() > 0.15 ? 'scheduled' : 'cancelled'

      shifts.push({
        id: generateId(),
        employeeId: emp.id,
        date: date.toISOString().split('T')[0],
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(Math.min(startHour + duration, 23)).padStart(2, '0')}:00`,
        status,
        vehicleId: Math.random() > 0.3 ? vehicleIds[Math.floor(Math.random() * vehicleIds.length)] : undefined,
      })
    }
  })

  return shifts
}

function generateActivityFeed(shifts: Shift[]): ActivityEvent[] {
  const events: ActivityEvent[] = []
  const now = new Date()

  const recentShifts = shifts
    .filter(s => s.status !== 'scheduled')
    .slice(0, 12)

  recentShifts.forEach((shift, i) => {
    const timestamp = new Date(now.getTime() - i * 35 * 60000)
    const emp = employees.find(e => e.id === shift.employeeId)
    const name = emp?.name ?? 'unknown'

    if (shift.status === 'completed') {
      events.push({
        id: generateId(),
        type: 'shift_completed',
        description: `${name} completed shift on ${shift.date}`,
        timestamp: timestamp.toISOString(),
        employeeId: shift.employeeId,
      })
    } else if (shift.status === 'active') {
      events.push({
        id: generateId(),
        type: 'shift_updated',
        description: `${name} started shift (${shift.startTime}–${shift.endTime})`,
        timestamp: timestamp.toISOString(),
        employeeId: shift.employeeId,
      })
    } else if (shift.status === 'cancelled') {
      events.push({
        id: generateId(),
        type: 'shift_updated',
        description: `shift cancelled for ${name} on ${shift.date}`,
        timestamp: timestamp.toISOString(),
        employeeId: shift.employeeId,
      })
    }
  })

  // add some vehicle events
  events.push({
    id: generateId(),
    type: 'vehicle_maintenance',
    description: 'unit 202 scheduled for oil change',
    timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
  })

  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10)
}

let cachedShifts: Shift[] | null = null

function getShifts(): Shift[] {
  if (!cachedShifts) cachedShifts = generateShifts()
  return cachedShifts
}

export const mockDataService = {
  async fetchEmployees(): Promise<Employee[]> {
    await delay()
    return [...employees]
  },

  async fetchShifts(): Promise<Shift[]> {
    await delay(300, 800)
    return [...getShifts()]
  },

  async fetchVehicles(): Promise<Vehicle[]> {
    await delay()
    return [...vehicles]
  },

  async fetchActivityFeed(): Promise<ActivityEvent[]> {
    await delay(200, 500)
    return generateActivityFeed(getShifts())
  },

  async updateShift(shift: Shift): Promise<Shift> {
    await delay(300, 600)
    if (cachedShifts) {
      const idx = cachedShifts.findIndex(s => s.id === shift.id)
      if (idx !== -1) cachedShifts[idx] = { ...shift }
    }
    return { ...shift }
  },

  async createShift(shift: Omit<Shift, 'id'>): Promise<Shift> {
    await delay(300, 600)
    const created = { ...shift, id: generateId() }
    cachedShifts?.push(created)
    return created
  },

  async fetchDashboardStats(): Promise<{
    activeDrivers: number
    dispatchedToday: number
    pendingInspections: number
    fleetUtilization: number
    onRoute: number
    available: number
    inMaintenance: number
  }> {
    await delay(200, 400)
    const shifts = getShifts()
    const today = new Date().toISOString().split('T')[0]
    const todayShifts = shifts.filter(s => s.date === today)
    const activeShifts = todayShifts.filter(s => s.status === 'active')
    const scheduledShifts = todayShifts.filter(s => s.status === 'scheduled')

    const onRoute = vehicles.filter(v => v.status === 'on-route').length
    const available = vehicles.filter(v => v.status === 'available').length
    const inMaintenance = vehicles.filter(v => v.status === 'maintenance').length

    return {
      activeDrivers: activeShifts.length + scheduledShifts.length,
      dispatchedToday: todayShifts.length,
      pendingInspections: Math.floor(Math.random() * 4) + 2,
      fleetUtilization: Math.round((onRoute / vehicles.length) * 100),
      onRoute,
      available,
      inMaintenance,
    }
  },
}
