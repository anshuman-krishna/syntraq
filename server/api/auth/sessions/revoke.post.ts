import { sessionController } from '../../../controllers/sessionController'

export default defineEventHandler(event => sessionController.revoke(event))
