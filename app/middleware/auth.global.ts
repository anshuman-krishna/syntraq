const publicRoutes = ['/', '/login', '/register', '/features', '/pricing', '/about', '/blog', '/billing/success', '/billing/cancel']

// the marketing blog is public, including individual posts under /blog/<slug>.
function isPublicRoute(path: string) {
  return publicRoutes.includes(path) || path.startsWith('/blog/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.fetchUser()
  }

  if (!auth.isAuthenticated && !isPublicRoute(to.path)) {
    return navigateTo('/login')
  }

  if (auth.isAuthenticated && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
