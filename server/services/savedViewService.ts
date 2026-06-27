import { generateId } from '../../shared/utils/id'
import { savedViewModel } from '../models/savedViewModel'
import { AppError } from './authService'

export interface ViewFilters {
  searchQuery?: string
  filterRole?: string
  filterStatus?: string
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

interface ViewInput {
  name: string
  filters: ViewFilters
}

export const savedViewService = {
  list(userId: string, companyId: string) {
    return savedViewModel.findByUser(userId, companyId).map(v => ({
      ...v,
      filters: JSON.parse(v.filters) as ViewFilters,
    }))
  },

  createView(input: ViewInput, userId: string, companyId: string) {
    const view = savedViewModel.create({
      id: generateId(),
      userId,
      companyId,
      name: input.name,
      filters: JSON.stringify(input.filters),
    })

    return { ...view, filters: input.filters }
  },

  removeView(id: string, userId: string, companyId: string) {
    const existing = savedViewModel.findById(id, userId, companyId)
    if (!existing) {
      throw new AppError('view not found', 404)
    }

    savedViewModel.remove(id, userId, companyId)
    return { id }
  },
}
