export const useSidebarStore = defineStore('sidebar', () => {
  const mobileOpen = ref(false)
  const collapsed = useLocalStorage('syntraq:sidebar-collapsed', false)

  function toggleMobile() {
    mobileOpen.value = !mobileOpen.value
  }

  function closeMobile() {
    mobileOpen.value = false
  }

  function toggleCollapse() {
    collapsed.value = !collapsed.value
  }

  return { mobileOpen, collapsed, toggleMobile, closeMobile, toggleCollapse }
})
