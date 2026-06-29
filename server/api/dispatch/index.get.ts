import { dispatchController } from '../../controllers/dispatchController'

export default defineEventHandler((event) => dispatchController.getBoard(event))
