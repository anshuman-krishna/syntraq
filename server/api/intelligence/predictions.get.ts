import { intelligenceController } from '../../controllers/intelligenceController'

export default defineEventHandler((event) => intelligenceController.getPredictions(event))
