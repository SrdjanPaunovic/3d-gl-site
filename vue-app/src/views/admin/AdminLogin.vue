<template>
  <div class="login-container">
    <div class="login-box">
      <h1><i class="fas fa-cube"></i> Admin</h1>
      <p class="subtitle">3D Gadgets Lab Management</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
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
          <label for="password">Password</label>
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
          {{ error }}
        </div>
        
        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          <template v-if="loading">
            <div class="spinner spinner-sm"></div>
          </template>
          <template v-else>
            <i class="fas fa-sign-in-alt"></i>
            Sign In
          </template>
        </button>
      </form>
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
}

.login-box {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  
  h1 {
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    text-align: center;
    color: var(--muted-color);
    margin-bottom: 2rem;
  }
}

.btn-full {
  width: 100%;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}
</style>
