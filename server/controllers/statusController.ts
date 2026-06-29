import type { H3Event } from 'h3'
import { statusService } from '../services/statusService'

export const statusController = {
  // public, unauthenticated — drives the marketing status strip
  getStatus(_event: H3Event) {
    return statusService.snapshot()
  },
}
