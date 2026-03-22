import { replayController } from '../../controllers/replayController'

export default defineEventHandler((event) => replayController.getSession(event))
