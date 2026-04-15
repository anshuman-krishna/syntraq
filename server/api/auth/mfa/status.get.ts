import { mfaController } from '../../../controllers/mfaController'

export default defineEventHandler(event => mfaController.status(event))
