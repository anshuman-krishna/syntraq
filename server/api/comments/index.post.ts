import { commentController } from '../../controllers/commentController'

export default defineEventHandler((event) => commentController.addComment(event))
