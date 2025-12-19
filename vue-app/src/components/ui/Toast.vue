<template>
  <Teleport to="body">
    <Transition name="toast">
      <div 
        v-if="visible" 
        class="toast"
        :class="`toast--${type}`"
      >
        <i :class="iconClass"></i>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '@/composables/useToast'

const { visible, message, type } = useToast()

const iconClass = computed(() => {
  const icons: Record<string, string> = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type.value] || icons.success
})
</script>

<style scoped lang="scss">
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  z-index: 9999;
  
  &--success {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid var(--success-color);
    color: var(--success-color);
  }
  
  &--error {
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid var(--error-color);
    color: var(--error-color);
  }
  
  &--warning {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid var(--warning-color);
    color: var(--warning-color);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
