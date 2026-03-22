export interface WorkflowStep {
  id: string
  name: string
  description?: string
  order: number
}

export interface Workflow {
  id: string
  name: string
  description?: string
  steps: WorkflowStep[]
  status: 'draft' | 'active' | 'archived'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkflowCreateInput {
  name: string
  description?: string
  steps: Omit<WorkflowStep, 'id'>[]
}
