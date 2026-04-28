import type { H3Event } from 'h3'
import { z } from 'zod'
import { onboardingService } from '../services/onboardingService'
import { requireAuth } from '../utils/auth'
import { readBodyWithSchema } from '../utils/validation'

const completeStepSchema = z.object({
  stepId: z.string().trim().min(1),
})

export const onboardingController = {
  getProgress(event: H3Event) {
    const user = requireAuth(event)
    onboardingService.initProgress(user.id, user.companyId)
    const progress = onboardingService.getProgress(user.id, user.companyId)
    return { ...progress, steps: onboardingService.steps }
  },

  async completeStep(event: H3Event) {
    const user = requireAuth(event)
    const body = await readBodyWithSchema(event, completeStepSchema)

    onboardingService.initProgress(user.id, user.companyId)
    const progress = onboardingService.completeStep(user.id, user.companyId, body.stepId)
    return progress
  },

  async skip(event: H3Event) {
    const user = requireAuth(event)
    onboardingService.initProgress(user.id, user.companyId)
    const progress = onboardingService.skipOnboarding(user.id, user.companyId)
    return progress
  },
}
