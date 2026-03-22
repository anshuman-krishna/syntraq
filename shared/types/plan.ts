export interface Plan {
  id: string
  name: string
  stripePriceId?: string | null
  maxUsers: number
  maxEmployees: number
  maxShiftsPerMonth: number
  maxWorkflows: number
  features: Record<string, boolean>
  price: number
}

export interface Usage {
  employees: number
  shifts: number
  totalShifts: number
  workflows: number
}

export interface PlanLimits {
  maxUsers: number
  maxEmployees: number
  maxShiftsPerMonth: number
  maxWorkflows: number
  features: Record<string, boolean>
}

export interface Subscription {
  id: string
  companyId: string
  planId: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  status: 'active' | 'cancelled' | 'expired'
  currentPeriodEnd?: Date | null
}
