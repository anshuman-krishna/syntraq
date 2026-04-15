import { passwordResetController } from '../../../controllers/passwordResetController'

export default defineEventHandler(event => passwordResetController.confirm(event))
