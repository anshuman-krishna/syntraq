import { dashboardController } from '../../controllers/dashboardController'

export default defineEventHandler((event) => dashboardController.getOverview(event))
