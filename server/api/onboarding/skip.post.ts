import { onboardingController } from '../../controllers/onboardingController'

export default defineEventHandler((event) => onboardingController.skip(event))
