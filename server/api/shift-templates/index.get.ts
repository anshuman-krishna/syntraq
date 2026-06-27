import { shiftTemplateController } from '../../controllers/shiftTemplateController'

export default defineEventHandler((event) => shiftTemplateController.getTemplates(event))
