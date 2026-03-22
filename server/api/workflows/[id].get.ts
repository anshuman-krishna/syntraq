import { workflowController } from '../../controllers/workflowController'

export default defineEventHandler((event) => workflowController.getById(event))
