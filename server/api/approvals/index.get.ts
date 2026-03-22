import { approvalController } from '../../controllers/approvalController'

export default defineEventHandler((event) => approvalController.getApprovals(event))
