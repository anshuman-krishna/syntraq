import type { H3Event } from 'h3'
import { z } from 'zod'
import { notificationPreferenceService, NOTIFICATION_TYPES } from '../services/notificationPreferenceService'
import { requireAuth } from '../utils/auth'
import { readBodyWithSchema } from '../utils/validation'

const updateSchema = z.object({
  preferences: z.record(z.enum(NOTIFICATION_TYPES), z.boolean()),
})

export const notificationPreferenceController = {
  get(event: H3Event) {
    const user = requireAuth(event)
    return notificationPreferenceService.get(user.id)
  },

  async update(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, updateSchema)
    return notificationPreferenceService.update(user.id, user.companyId, body.preferences)
  },
}
