import { webhookController } from '../../controllers/webhookController'

export default defineEventHandler((event) => webhookController.logs(event))
