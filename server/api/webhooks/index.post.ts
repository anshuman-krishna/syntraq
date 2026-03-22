import { webhookController } from '../../controllers/webhookController'

export default defineEventHandler((event) => webhookController.create(event))
