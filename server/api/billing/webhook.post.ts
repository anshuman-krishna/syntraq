import { billingController } from '../../controllers/billingController'

export default defineEventHandler(event => billingController.handleWebhook(event))
