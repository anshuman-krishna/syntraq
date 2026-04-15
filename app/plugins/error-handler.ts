export default defineNuxtPlugin((nuxtApp) => {
  const report = (scope: string, error: unknown, info: string) => {
    if (import.meta.dev) {
      // eslint-disable-next-line no-console
      console.error(`[syntraq] ${scope} error in ${info}:`, error)
    }
    // prod: hook sentry / external tracker here (improvement phase 5)
  }

  nuxtApp.vueApp.config.errorHandler = (error, _instance, info) => {
    report('vue', error, info)
  }

  nuxtApp.hook('vue:error', (error, _instance, info) => {
    report('unhandled', error, info)
  })
})
