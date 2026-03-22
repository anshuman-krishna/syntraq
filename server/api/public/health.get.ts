import { healthService } from '../../services/healthService'

export default defineEventHandler(() => {
  return healthService.check()
})
