import { notificationController } from '../../controllers/notificationController'

export default defineEventHandler((event) => notificationController.getAll(event))
