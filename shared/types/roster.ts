export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'
export type EmployeeRole = 'driver' | 'operator' | 'mechanic' | 'supervisor'
export type VehicleStatus = 'available' | 'on-route' | 'maintenance'

export interface Employee {
  id: string
  name: string
  role: EmployeeRole
  email: string
  phone: string
  hireDate: string
  avatar?: string
}

export interface Shift {
  id: string
  employeeId: string
  date: string
  startTime: string
  endTime: string
  status: ShiftStatus
  vehicleId?: string
  notes?: string
}

export interface Vehicle {
  id: string
  name: string
  plate: string
  type: 'truck' | 'hydrovac' | 'service'
  status: VehicleStatus
  mileage: number
}

export interface ActivityEvent {
  id: string
  type: 'shift_created' | 'shift_updated' | 'shift_completed' | 'employee_added' | 'vehicle_maintenance'
  description: string
  timestamp: string
  employeeId?: string
}

export interface RosterEntry {
  employee: Employee
  shifts: Shift[]
}

export type SortField = 'name' | 'role' | 'status'
export type SortDirection = 'asc' | 'desc'
