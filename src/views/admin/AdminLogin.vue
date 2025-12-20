<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <div class="login-box">
      <div class="login-logo">
        <i class="fas fa-cube"></i>
      </div>
      <h1>Admin Panel</h1>
      <p class="subtitle">3D Gadgets Lab Management</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i>
            Email
          </label>
          <input 
            v-model="email" 
            type="email" 
            id="email" 
            class="form-control" 
            required 
            placeholder="admin@example.com"
          >
        </div>
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Password
          </label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            class="form-control" 
            required 
            placeholder="••••••••"
          >
        </div>
        
        <div v-if="error" class="alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>
        
        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          <template v-if="loading">
            <div class="spinner spinner-sm"></div>
            Signing in...
          </template>
          <template v-else>
            <i class="fas fa-sign-in-alt"></i>
            Sign In
          </template>
        </button>
      </form>
      
      <div class="login-footer">
        <RouterLink to="/" class="back-link">
          <i class="fas fa-arrow-left"></i>
          Back to Store
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

async function handleLogin() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/admin')
  }
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 30% 30%, rgba(78, 141, 245, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 70%, rgba(243, 94, 145, 0.15) 0%, transparent 50%);
  z-index: 0;
}

.login-box {
  position: relative;
  z-index: 1;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 3rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  
  h1 {
    text-align: center;
    margin-bottom: 0.35rem;
    font-size: 1.75rem;
  }
  
  .subtitle {
    text-align: center;
    color: var(--muted-color);
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }
}

.login-logo {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 2rem;
    color: white;
  }
}

.form-group {
  margin-bottom: 1.25rem;
  
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    
    i {
      color: var(--muted-color);
      font-size: 0.85rem;
    }
  }
}

.form-control {
  width: 100%;
  padding: 0.9rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-color);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(78, 141, 245, 0.15);
  }
  
  &::placeholder {
    color: var(--muted-color);
    opacity: 0.6;
  }
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: var(--error-color);
}

.btn-full {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

.login-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted-color);
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
  }
}
</style>
