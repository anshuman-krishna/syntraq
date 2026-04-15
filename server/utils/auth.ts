import type { H3Event } from 'h3'
import { apiError } from './errors'

export interface AuthContext {
  id: string
  email: string
  name: string
  role: string
  companyId: string
}

export function requireAuth(event: H3Event): AuthContext {
  const user = event.context.user
  if (!user) {
    throw apiError('unauthenticated', 'not authenticated', undefined, event)
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  }
}

export function requirePermission(user: AuthContext, allowed: boolean, action: string, event?: H3Event) {
  if (!allowed) {
    throw apiError('forbidden', `insufficient permissions: ${action}`, { action }, event)
  }
}
