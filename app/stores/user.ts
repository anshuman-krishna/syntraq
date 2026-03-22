export const useUserStore = defineStore('user', () => {
  const preferences = useLocalStorage('syntraq:preferences', {
    theme: 'dark' as 'dark' | 'light',
    compactMode: false,
  })

  return { preferences }
})
