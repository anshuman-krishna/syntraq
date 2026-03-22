type Role = 'admin' | 'manager' | 'operator'

interface UserContext {
  id: string
  role: string
  companyId: string
}

const roleHierarchy: Record<Role, number> = {
  admin: 3,
  manager: 2,
  operator: 1,
}

function hasMinRole(user: UserContext, minRole: Role): boolean {
  const userLevel = roleHierarchy[user.role as Role] ?? 0
  const requiredLevel = roleHierarchy[minRole]
  return userLevel >= requiredLevel
}

export const permissionService = {
  // roster
  canViewRoster(user: UserContext): boolean {
    return hasMinRole(user, 'operator')
  },

  canEditShift(user: UserContext): boolean {
    return hasMinRole(user, 'manager')
  },

  canCreateShift(user: UserContext): boolean {
    return hasMinRole(user, 'manager')
  },

  // workflows
  canViewWorkflows(user: UserContext): boolean {
    return hasMinRole(user, 'operator')
  },

  canManageWorkflows(user: UserContext): boolean {
    return hasMinRole(user, 'manager')
  },

  // dashboard
  canViewDashboard(user: UserContext): boolean {
    return hasMinRole(user, 'operator')
  },

  canViewInsights(user: UserContext): boolean {
    return hasMinRole(user, 'manager')
  },

  // audit
  canViewAuditLog(user: UserContext): boolean {
    return hasMinRole(user, 'admin')
  },

  // company management
  canManageCompany(user: UserContext): boolean {
    return hasMinRole(user, 'admin')
  },

  canManageUsers(user: UserContext): boolean {
    return hasMinRole(user, 'admin')
  },
}
