import { messageController } from '../../controllers/messageController'

export default defineEventHandler((event) => messageController.getMessages(event))
