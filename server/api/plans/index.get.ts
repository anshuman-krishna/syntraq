import { planController } from '../../controllers/planController'

export default defineEventHandler(() => planController.getPlans())
