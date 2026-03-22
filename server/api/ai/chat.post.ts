import { aiController } from '../../controllers/aiController'

export default defineEventHandler((event) => aiController.chat(event))
