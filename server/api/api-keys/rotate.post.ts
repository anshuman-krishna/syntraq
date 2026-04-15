import { apiKeyController } from '../../controllers/apiKeyController'

export default defineEventHandler(event => apiKeyController.rotate(event))
