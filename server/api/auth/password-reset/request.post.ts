import { passwordResetController } from '../../../controllers/passwordResetController'

export default defineEventHandler(event => passwordResetController.request(event))
