import { eq, desc, and } from 'drizzle-orm'
import { db } from '../db/client'
import { maintenanceRecords } from '../db/schema'

export const maintenanceRecordModel = {
  findByCompany(companyId: string) {
    return db.select().from(maintenanceRecords)
      .where(eq(maintenanceRecords.companyId, companyId))
      .orderBy(desc(maintenanceRecords.date))
      .all()
  },

  findByVehicle(vehicleId: string, companyId: string) {
    return db.select().from(maintenanceRecords)
      .where(and(eq(maintenanceRecords.vehicleId, vehicleId), eq(maintenanceRecords.companyId, companyId)))
      .orderBy(desc(maintenanceRecords.date))
      .all()
  },

  create(data: typeof maintenanceRecords.$inferInsert) {
    return db.insert(maintenanceRecords).values(data).returning().get()
  },
}
