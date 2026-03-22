import { planController } from '../../controllers/planController'

export default defineEventHandler((event) => planController.changePlan(event))
