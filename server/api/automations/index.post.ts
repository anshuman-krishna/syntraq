import { automationController } from '../../controllers/automationController'

export default defineEventHandler((event) => automationController.create(event))
