import { publicApiController } from '../../../controllers/publicApiController'

export default defineEventHandler((event) => publicApiController.listEmployees(event))
