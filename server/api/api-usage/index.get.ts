import { apiUsageController } from '../../controllers/apiUsageController'

export default defineEventHandler((event) => apiUsageController.getSummary(event))
