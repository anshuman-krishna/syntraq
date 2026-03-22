import { escalationController } from '../../controllers/escalationController'

export default defineEventHandler((event) => escalationController.updateStatus(event))
