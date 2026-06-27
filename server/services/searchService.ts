import { employeeModel } from '../models/employeeModel'
import { vehicleModel } from '../models/vehicleModel'
import { workflowModel } from '../models/workflowModel'

export interface SearchResult {
  type: 'employee' | 'vehicle' | 'workflow'
  id: string
  label: string
  sublabel: string
  route: string
}

const MAX_PER_TYPE = 5
const MAX_TOTAL = 12

export const searchService = {
  search(companyId: string, query: string): SearchResult[] {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    const employees = employeeModel.findAll(companyId)
      .filter(e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q))
      .slice(0, MAX_PER_TYPE)
      .map((e): SearchResult => ({ type: 'employee', id: e.id, label: e.name, sublabel: e.role, route: '/roster' }))

    const vehicles = vehicleModel.findAll(companyId)
      .filter(v => v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q))
      .slice(0, MAX_PER_TYPE)
      .map((v): SearchResult => ({ type: 'vehicle', id: v.id, label: v.name, sublabel: v.plate, route: '/maintenance' }))

    const workflows = workflowModel.findAll(companyId)
      .filter(w => w.name.toLowerCase().includes(q))
      .slice(0, MAX_PER_TYPE)
      .map((w): SearchResult => ({ type: 'workflow', id: w.id, label: w.name, sublabel: w.status, route: '/workflows' }))

    return [...employees, ...vehicles, ...workflows].slice(0, MAX_TOTAL)
  },
}
