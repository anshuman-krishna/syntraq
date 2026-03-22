import { webhookController } from '../../controllers/webhookController'

export default defineEventHandler((event) => webhookController.update(event))
