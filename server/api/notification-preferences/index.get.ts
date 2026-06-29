import { notificationPreferenceController } from '../../controllers/notificationPreferenceController'

export default defineEventHandler((event) => notificationPreferenceController.get(event))
