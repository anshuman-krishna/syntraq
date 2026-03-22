import { auditController } from '../../controllers/auditController'

export default defineEventHandler((event) => auditController.getLogs(event))
