import { planModel } from '../models/planModel'
import { subscriptionModel } from '../models/subscriptionModel'
import { employeeModel } from '../models/employeeModel'
import { shiftModel } from '../models/shiftModel'
import { workflowModel } from '../models/workflowModel'
import { AppError } from './authService'

interface PlanLimits {
  maxUsers: number
  maxEmployees: number
  maxShiftsPerMonth: number
  maxWorkflows: number
  features: Record<string, boolean>
}

const DEFAULT_FREE_LIMITS: PlanLimits = {
  maxUsers: 3,
  maxEmployees: 5,
  maxShiftsPerMonth: 50,
  maxWorkflows: 2,
  features: { replay: false, insights: false, audit: false },
}

export const usageService = {
  getPlanLimits(companyId: string): PlanLimits {
    const sub = subscriptionModel.findByCompany(companyId)
    if (!sub) return DEFAULT_FREE_LIMITS

    const plan = planModel.findById(sub.planId)
    if (!plan) return DEFAULT_FREE_LIMITS

    let features: Record<string, boolean> = {}
    try {
      features = JSON.parse(plan.features)
    } catch {
      features = {}
    }

    return {
      maxUsers: plan.maxUsers,
      maxEmployees: plan.maxEmployees,
      maxShiftsPerMonth: plan.maxShiftsPerMonth,
      maxWorkflows: plan.maxWorkflows,
      features,
    }
  },

  getUsage(companyId: string) {
    const employees = employeeModel.findAll(companyId)
    const shifts = shiftModel.findAll(companyId)
    const workflows = workflowModel.findAll(companyId)

    // count shifts created this month
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const monthlyShifts = shifts.filter(s => s.date >= monthStart)

    return {
      employees: employees.length,
      shifts: monthlyShifts.length,
      totalShifts: shifts.length,
      workflows: workflows.length,
    }
  },

  getCompanyPlan(companyId: string) {
    const sub = subscriptionModel.findByCompany(companyId)
    if (!sub) return { planName: 'free', planId: 'free' }

    const plan = planModel.findById(sub.planId)
    return { planName: plan?.name ?? 'free', planId: sub.planId }
  },

  checkEmployeeLimit(companyId: string) {
    const limits = this.getPlanLimits(companyId)
    const usage = this.getUsage(companyId)
    if (usage.employees >= limits.maxEmployees) {
      throw new AppError(`employee limit reached (${limits.maxEmployees}). upgrade to add more.`, 403)
    }
  },

  checkShiftLimit(companyId: string) {
    const limits = this.getPlanLimits(companyId)
    const usage = this.getUsage(companyId)
    if (usage.shifts >= limits.maxShiftsPerMonth) {
      throw new AppError(`monthly shift limit reached (${limits.maxShiftsPerMonth}). upgrade for more.`, 403)
    }
  },

  checkWorkflowLimit(companyId: string) {
    const limits = this.getPlanLimits(companyId)
    const usage = this.getUsage(companyId)
    if (usage.workflows >= limits.maxWorkflows) {
      throw new AppError(`workflow limit reached (${limits.maxWorkflows}). upgrade for more.`, 403)
    }
  },

  checkFeature(companyId: string, feature: string) {
    const limits = this.getPlanLimits(companyId)
    if (limits.features[feature] === false) {
      throw new AppError(`${feature} requires a paid plan. upgrade to unlock.`, 403)
    }
  },

  getLimitsAndUsage(companyId: string) {
    return {
      limits: this.getPlanLimits(companyId),
      usage: this.getUsage(companyId),
      plan: this.getCompanyPlan(companyId),
    }
  },
}
