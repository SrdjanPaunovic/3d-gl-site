<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon products">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalProducts }}</h3>
          <p>{{ t('admin.totalProducts') }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon orders">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalOrders }}</h3>
          <p>{{ t('admin.totalOrders') }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-info">
          <h3>{{ stats.pendingOrders }}</h3>
          <p>{{ t('admin.pendingOrders') }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon revenue">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="stat-info">
          <h3>{{ formatPrice(stats.totalRevenue) }}</h3>
          <p>{{ t('admin.totalRevenue') }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>{{ t('admin.recentOrders') }}</h2>
        <RouterLink to="/admin/orders" class="btn btn-secondary btn-sm">
          {{ t('admin.viewAll') }}
        </RouterLink>
      </div>
      
      <div class="orders-table-wrapper">
        <table class="orders-table" v-if="recentOrders.length">
          <thead>
            <tr>
              <th>{{ t('admin.orderId') }}</th>
              <th>{{ t('admin.customer') }}</th>
              <th>{{ t('admin.total') }}</th>
              <th>{{ t('admin.status') }}</th>
              <th>{{ t('admin.date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td><code>{{ order.id.slice(0, 8) }}</code></td>
              <td>{{ order.customer.name }}</td>
              <td>{{ formatPrice(order.total) }}</td>
              <td><span class="status" :class="order.status">{{ order.status }}</span></td>
              <td>{{ order.createdAt ? formatDate(order.createdAt) : '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>{{ t('admin.noOrders') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const { t } = useI18n()

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    ordersStore.fetchOrders()
  ])
})

const stats = computed(() => {
  const orders = ordersStore.orders
  const completedOrders = orders.filter(o => o.status === 'completed')
  
  return {
    totalProducts: productsStore.products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: completedOrders.reduce((sum, o) => sum + o.total, 0)
  }
})

const recentOrders = computed(() => {
  return [...ordersStore.orders]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 5)
})

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped lang="scss">
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  
  &.products {
    background: rgba(99, 102, 241, 0.2);
    color: #818cf8;
  }
  
  &.orders {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }
  
  &.pending {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }
  
  &.revenue {
    background: rgba(236, 72, 153, 0.2);
    color: #f472b6;
  }
}

.stat-info {
  h3 {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
  }
  
  p {
    color: var(--muted-color);
    font-size: 0.875rem;
  }
}

.dashboard-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.25rem;
  }
}

.orders-table-wrapper {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.875rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    color: var(--muted-color);
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  code {
    background: var(--bg-darker);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
}

.status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  
  &.pending {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
  }
  
  &.processing {
    background: rgba(99, 102, 241, 0.2);
    color: #818cf8;
  }
  
  &.completed {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }
  
  &.cancelled {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--muted-color);
  
  i {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
}
</style>
