import type { H3Event } from 'h3'

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
    throw createError({ statusCode: 401, message: 'not authenticated' })
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  }
}

export function requirePermission(user: AuthContext, allowed: boolean, action: string) {
  if (!allowed) {
    throw createError({ statusCode: 403, message: `insufficient permissions: ${action}` })
  }
}
