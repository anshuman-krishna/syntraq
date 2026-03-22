import { intelligenceController } from '../../controllers/intelligenceController'

export default defineEventHandler((event) => intelligenceController.getAnomalies(event))
