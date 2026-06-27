import { savedViewController } from '../../controllers/savedViewController'

export default defineEventHandler((event) => savedViewController.createView(event))
