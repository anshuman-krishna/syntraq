export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue) as Ref<T>

  function read() {
    if (import.meta.server) return
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        data.value = JSON.parse(stored)
      }
    } catch {
      // corrupted data, reset
      localStorage.removeItem(key)
    }
  }

  function write() {
    if (import.meta.server) return
    localStorage.setItem(key, JSON.stringify(data.value))
  }

  read()
  watch(data, write, { deep: true })

  return data
}
