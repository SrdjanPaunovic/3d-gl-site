<template>
  <Teleport to="body">
    <Transition name="toast">
      <div 
        v-if="visible" 
        class="toast"
        :class="`toast--${type}`"
      >
        <div class="toast-icon">
          <i :class="iconClass"></i>
        </div>
        <span class="toast-message">{{ message }}</span>
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
    success: 'fas fa-check',
    error: 'fas fa-times',
    warning: 'fas fa-exclamation',
    info: 'fas fa-info'
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
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  z-index: 9999;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  max-width: 400px;
  
  @media (max-width: 480px) {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}

.toast-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  i {
    font-size: 0.9rem;
  }
}

.toast-message {
  font-weight: 500;
  line-height: 1.4;
}

.toast--success {
  background: rgba(74, 222, 128, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
  
  .toast-icon {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }
}

.toast--error {
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
  
  .toast-icon {
    background: rgba(248, 113, 113, 0.2);
    color: #f87171;
  }
}

.toast--warning {
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
  
  .toast-icon {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }
}

.toast--info {
  background: rgba(78, 141, 245, 0.15);
  border: 1px solid rgba(78, 141, 245, 0.4);
  color: #4e8df5;
  
  .toast-icon {
    background: rgba(78, 141, 245, 0.2);
    color: #4e8df5;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
