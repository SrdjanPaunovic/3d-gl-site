<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="type">
      <i :class="iconClass"></i>
      <span>{{ message }}</span>
      <button class="toast-close" @click="hide">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '@/composables/useToast'

const { message, type, visible, hide } = useToast()

const iconClass = computed(() => {
  const icons: Record<string, string> = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[type.value] || icons.info
})
</script>

<style scoped lang="scss">
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  
  i:first-child {
    font-size: 1.25rem;
  }
  
  &.success {
    border-color: var(--success-color);
    
    i:first-child {
      color: var(--success-color);
    }
  }
  
  &.error {
    border-color: var(--error-color);
    
    i:first-child {
      color: var(--error-color);
    }
  }
  
  &.warning {
    border-color: var(--warning-color);
    
    i:first-child {
      color: var(--warning-color);
    }
  }
  
  &.info {
    border-color: var(--primary-color);
    
    i:first-child {
      color: var(--primary-color);
    }
  }
}

.toast-close {
  background: none;
  border: none;
  color: var(--muted-color);
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  
  &:hover {
    color: var(--text-color);
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
