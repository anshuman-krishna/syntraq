import { rosterController } from '../../controllers/rosterController'

export default defineEventHandler((event) => rosterController.createShift(event))
