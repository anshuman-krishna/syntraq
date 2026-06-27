import { shiftTemplateController } from '../../controllers/shiftTemplateController'

export default defineEventHandler((event) => shiftTemplateController.removeTemplate(event))
