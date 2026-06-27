import { shiftTemplateController } from '../../controllers/shiftTemplateController'

export default defineEventHandler((event) => shiftTemplateController.applyTemplate(event))
