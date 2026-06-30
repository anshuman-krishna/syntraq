import { blogController } from '../../controllers/blogController'

export default defineEventHandler(event => blogController.getPost(event))
