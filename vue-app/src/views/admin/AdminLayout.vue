<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="admin-logo">
        <i class="fas fa-cube"></i>
        <span>3D Gadgets Lab</span>
      </div>
      <nav class="admin-nav">
        <RouterLink to="/admin" :class="{ active: $route.name === 'admin-dashboard' }">
          <i class="fas fa-home"></i>
          <span>{{ t('admin.dashboard') }}</span>
        </RouterLink>
        <RouterLink to="/admin/products" :class="{ active: $route.name === 'admin-products' }">
          <i class="fas fa-box"></i>
          <span>{{ t('admin.products') }}</span>
        </RouterLink>
        <RouterLink to="/admin/orders" :class="{ active: $route.name === 'admin-orders' }">
          <i class="fas fa-shopping-bag"></i>
          <span>{{ t('admin.orders') }}</span>
        </RouterLink>
        <a href="/shop" target="_blank">
          <i class="fas fa-external-link-alt"></i>
          <span>{{ t('admin.viewShop') }}</span>
        </a>
        <a href="#" @click.prevent="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span>{{ t('admin.logout') }}</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <div class="admin-header">
        <h1>{{ pageTitle }}</h1>
        <div class="admin-user">
          <div class="admin-user-avatar">{{ userInitial }}</div>
          <span>{{ userEmail }}</span>
        </div>
      </div>

      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const userEmail = computed(() => authStore.user?.email || 'Admin')
const userInitial = computed(() => userEmail.value[0].toUpperCase())

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'admin-dashboard': t('admin.dashboard'),
    'admin-products': t('admin.products'),
    'admin-orders': t('admin.orders')
  }
  return titles[route.name as string] || t('admin.dashboard')
})

async function handleLogout() {
  await authStore.logout()
  router.push('/admin/login')
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 250px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.admin-logo {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    color: var(--primary-color);
  }
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    color: var(--muted-color);
    transition: all var(--transition-speed);
    
    &:hover {
      background: var(--card-bg-hover);
      color: var(--text-color);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
    }
    
    i {
      width: 20px;
    }
  }
}

.admin-main {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.75rem;
  }
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-user-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    width: 70px;
    padding: 1rem 0.5rem;
    
    .admin-logo span,
    .admin-nav a span {
      display: none;
    }
    
    .admin-nav a {
      justify-content: center;
      padding: 0.75rem;
      
      i {
        width: auto;
        font-size: 1.25rem;
      }
    }
  }
  
  .admin-main {
    margin-left: 70px;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    display: none;
  }
  
  .admin-main {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>
