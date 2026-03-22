import { notificationController } from '../../controllers/notificationController'

export default defineEventHandler((event) => notificationController.markRead(event))
