import { authController } from '../../controllers/authController'

export default defineEventHandler((event) => authController.me(event))
