import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'warning' | 'info'>('success')

let timeout: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function show(msg: string, toastType: 'success' | 'error' | 'warning' | 'info' = 'success', duration: number = 3000) {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    message.value = msg
    type.value = toastType
    visible.value = true
    
    timeout = setTimeout(() => {
      visible.value = false
    }, duration)
  }
  
  // Alias for convenience
  function showToast(msg: string, toastType: 'success' | 'error' | 'warning' | 'info' = 'success', duration: number = 3000) {
    show(msg, toastType, duration)
  }

  function hide() {
    visible.value = false
    if (timeout) {
      clearTimeout(timeout)
    }
  }

  return {
    visible,
    message,
    type,
    show,
    showToast,
    hide
  }
}
