import { behaviorController } from '../../controllers/behaviorController'

export default defineEventHandler((event) => behaviorController.suggestTutorial(event))
