import { monitoringController } from '../../controllers/monitoringController'

export default defineEventHandler((event) => monitoringController.captureClientError(event))
