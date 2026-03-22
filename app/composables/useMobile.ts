const isMobile = ref(false)
const isStandalone = ref(false)
const viewportHeight = ref(0)

export function useMobile() {
  onMounted(() => {
    const check = () => {
      isMobile.value = window.innerWidth < 768
      viewportHeight.value = window.innerHeight
    }

    check()
    window.addEventListener('resize', check)

    // detect if running as installed PWA
    isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as { standalone?: boolean }).standalone === true

    onUnmounted(() => window.removeEventListener('resize', check))
  })

  return {
    isMobile: readonly(isMobile),
    isStandalone: readonly(isStandalone),
    viewportHeight: readonly(viewportHeight),
  }
}
