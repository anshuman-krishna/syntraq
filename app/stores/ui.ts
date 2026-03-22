import type { Toast, ToastType } from '@shared/types/ui'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const commandOpen = ref(false)
  const globalLoading = ref(false)

  function addToast(opts: { type: ToastType; message: string; duration?: number }) {
    const id = Math.random().toString(36).substring(2, 8)
    const duration = opts.duration ?? 3000
    toasts.value.push({ id, type: opts.type, message: opts.message, duration })

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function openCommand() {
    commandOpen.value = true
  }

  function closeCommand() {
    commandOpen.value = false
  }

  return {
    toasts,
    commandOpen,
    globalLoading,
    addToast,
    removeToast,
    openCommand,
    closeCommand,
  }
})
