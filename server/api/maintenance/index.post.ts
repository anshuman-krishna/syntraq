import { maintenanceController } from '../../controllers/maintenanceController'

export default defineEventHandler((event) => maintenanceController.createRecord(event))
