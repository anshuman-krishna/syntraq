interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'operator'
  companyId: string
  companyName: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')
  const isOperator = computed(() => !!user.value)

  function hasMinRole(minRole: 'admin' | 'manager' | 'operator'): boolean {
    const hierarchy = { admin: 3, manager: 2, operator: 1 }
    const userLevel = hierarchy[user.value?.role ?? 'operator'] ?? 0
    return userLevel >= hierarchy[minRole]
  }

  async function fetchUser() {
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      user.value = data.user
      return { success: true }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'login failed'
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, name: string, companyName: string) {
    loading.value = true
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: { email, password, name, companyName },
      })
      user.value = data.user
      return { success: true }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'registration failed'
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
    }
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    isManager,
    isOperator,
    hasMinRole,
    fetchUser,
    login,
    register,
    logout,
  }
})
