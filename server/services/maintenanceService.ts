import { generateId } from '../../shared/utils/id'
import { maintenanceRecordModel } from '../models/maintenanceRecordModel'
import { vehicleModel } from '../models/vehicleModel'
import { activityModel } from '../models/activityModel'
import { AppError } from './authService'

interface MaintenanceInput {
  vehicleId: string
  type: 'service' | 'inspection' | 'repair'
  date: string
  odometer?: number | null
  cost?: number | null
  status?: 'scheduled' | 'in-progress' | 'completed'
  notes?: string | null
}

export const maintenanceService = {
  // records enriched with vehicle name, plus the vehicle list for selection
  getOverview(companyId: string) {
    const vehicles = vehicleModel.findAll(companyId)
    const names = new Map(vehicles.map(v => [v.id, v.name]))
    const records = maintenanceRecordModel.findByCompany(companyId).map(r => ({
      ...r,
      vehicleName: names.get(r.vehicleId) ?? 'unknown',
    }))

    return { records, vehicles }
  },

  createRecord(input: MaintenanceInput, companyId: string, userId: string) {
    const vehicle = vehicleModel.findById(input.vehicleId, companyId)
    if (!vehicle) {
      throw new AppError('vehicle not found', 404)
    }

    const record = maintenanceRecordModel.create({
      id: generateId(),
      companyId,
      vehicleId: input.vehicleId,
      type: input.type,
      date: input.date,
      odometer: input.odometer ?? null,
      cost: input.cost ?? null,
      status: input.status ?? 'completed',
      notes: input.notes ?? null,
      createdBy: userId,
    })

    activityModel.create({
      id: generateId(),
      companyId,
      type: 'vehicle_maintenance',
      description: `${input.type} logged for ${vehicle.name}`,
    })

    return { ...record, vehicleName: vehicle.name }
  },
}
