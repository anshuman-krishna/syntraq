import { savedViewController } from '../../controllers/savedViewController'

export default defineEventHandler((event) => savedViewController.getViews(event))
