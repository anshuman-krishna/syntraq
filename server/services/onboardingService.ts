import { generateId } from '../../shared/utils/id'
import { onboardingModel } from '../models/onboardingModel'

const ONBOARDING_STEPS = [
  { id: 'explore_dashboard', label: 'explore the dashboard' },
  { id: 'view_roster', label: 'view the roster' },
  { id: 'create_shift', label: 'create your first shift' },
  { id: 'create_workflow', label: 'set up a workflow' },
] as const

export type OnboardingStepId = typeof ONBOARDING_STEPS[number]['id']

export const onboardingService = {
  steps: ONBOARDING_STEPS,

  getProgress(userId: string, companyId: string) {
    const record = onboardingModel.findByUser(userId, companyId)
    if (!record) return { completedSteps: [] as string[], completed: false }

    let completedSteps: string[] = []
    try {
      completedSteps = JSON.parse(record.completedSteps)
    } catch {
      completedSteps = []
    }

    return { completedSteps, completed: record.completed }
  },

  initProgress(userId: string, companyId: string) {
    const existing = onboardingModel.findByUser(userId, companyId)
    if (existing) return existing

    return onboardingModel.create({
      id: generateId(),
      userId,
      companyId,
      completedSteps: '[]',
      completed: false,
    })
  },

  completeStep(userId: string, companyId: string, stepId: string) {
    const progress = this.getProgress(userId, companyId)
    if (progress.completed) return progress

    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId)
    }

    const allDone = ONBOARDING_STEPS.every(s => progress.completedSteps.includes(s.id))

    onboardingModel.update(userId, companyId, {
      completedSteps: JSON.stringify(progress.completedSteps),
      completed: allDone,
      completedAt: allDone ? new Date() : undefined,
    })

    return { completedSteps: progress.completedSteps, completed: allDone }
  },

  skipOnboarding(userId: string, companyId: string) {
    onboardingModel.update(userId, companyId, {
      completed: true,
      completedAt: new Date(),
    })
    return { completedSteps: [], completed: true }
  },
}
