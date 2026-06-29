import { statusController } from '../controllers/statusController'

export default defineEventHandler((event) => statusController.getStatus(event))
