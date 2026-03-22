export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, _instance, info) => {
    console.error(`[syntraq] vue error in ${info}:`, error)
  }

  nuxtApp.hook('vue:error', (error, _instance, info) => {
    console.error(`[syntraq] unhandled error in ${info}:`, error)
  })
})
