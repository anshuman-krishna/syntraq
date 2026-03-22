import { billingController } from '../../controllers/billingController'

export default defineEventHandler(event => billingController.createCheckout(event))
