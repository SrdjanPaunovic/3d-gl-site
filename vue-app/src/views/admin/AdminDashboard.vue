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
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  
  &.products {
    background: rgba(78, 141, 245, 0.15);
    color: var(--primary-color);
  }
  
  &.orders {
    background: rgba(74, 222, 128, 0.15);
    color: var(--success-color);
  }
  
  &.pending {
    background: rgba(251, 191, 36, 0.15);
    color: var(--warning-color);
  }
  
  &.revenue {
    background: rgba(243, 94, 145, 0.15);
    color: var(--accent-color);
  }
}

.stat-info {
  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    line-height: 1;
  }
  
  p {
    color: var(--muted-color);
    font-size: 0.875rem;
    margin: 0;
  }
}

.dashboard-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  
  h2 {
    font-size: 1.25rem;
    margin: 0;
  }
}

.orders-table-wrapper {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    color: var(--muted-color);
    font-weight: 500;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  tbody tr {
    transition: background 0.2s ease;
    
    &:hover {
      background: var(--card-bg-hover);
    }
  }
  
  code {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.35rem 0.6rem;
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--primary-color);
  }
}

.status {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.pending {
    background: rgba(251, 191, 36, 0.15);
    color: var(--warning-color);
  }
  
  &.processing {
    background: rgba(78, 141, 245, 0.15);
    color: var(--primary-color);
  }
  
  &.completed {
    background: rgba(74, 222, 128, 0.15);
    color: var(--success-color);
  }
  
  &.cancelled {
    background: rgba(248, 113, 113, 0.15);
    color: var(--error-color);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--muted-color);
  
  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
    opacity: 0.5;
  }
  
  p {
    margin: 0;
  }
}
</style>
