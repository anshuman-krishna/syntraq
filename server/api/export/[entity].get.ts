import { exportController } from '../../controllers/exportController'

export default defineEventHandler((event) => exportController.download(event))
