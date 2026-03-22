import { authController } from '../../controllers/authController'

export default defineEventHandler((event) => authController.logout(event))
