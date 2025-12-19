<template>
  <div class="admin-orders">
    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group">
        <select v-model="statusFilter" class="form-control">
          <option value="">{{ t('admin.allStatuses') }}</option>
          <option value="pending">{{ t('order.pending') }}</option>
          <option value="processing">{{ t('order.processing') }}</option>
          <option value="completed">{{ t('order.completed') }}</option>
          <option value="cancelled">{{ t('order.cancelled') }}</option>
        </select>
      </div>
      <div class="filter-group search">
        <input 
          v-model="searchQuery" 
          type="text" 
          class="form-control" 
          :placeholder="t('admin.searchOrders')"
        >
        <i class="fas fa-search"></i>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="orders-table-wrapper">
      <table class="orders-table" v-if="filteredOrders.length">
        <thead>
          <tr>
            <th>{{ t('admin.orderId') }}</th>
            <th>{{ t('admin.customer') }}</th>
            <th>{{ t('admin.items') }}</th>
            <th>{{ t('admin.total') }}</th>
            <th>{{ t('admin.status') }}</th>
            <th>{{ t('admin.date') }}</th>
            <th>{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td><code>{{ order.id.slice(0, 8) }}</code></td>
            <td>
              <div class="customer-info">
                <strong>{{ order.customer.name }}</strong>
                <small>{{ order.customer.email }}</small>
              </div>
            </td>
            <td>{{ order.items.length }} items</td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>
              <select 
                v-model="order.status" 
                class="status-select"
                :class="order.status"
                @change="handleStatusChange(order)"
              >
                <option value="pending">{{ t('order.pending') }}</option>
                <option value="processing">{{ t('order.processing') }}</option>
                <option value="completed">{{ t('order.completed') }}</option>
                <option value="cancelled">{{ t('order.cancelled') }}</option>
              </select>
            </td>
            <td>{{ order.createdAt ? formatDate(order.createdAt) : '-' }}</td>
            <td>
              <button class="btn btn-icon" @click="viewOrder(order)" :title="t('admin.view')">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>{{ t('admin.noOrders') }}</p>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click.self="selectedOrder = null">
      <div class="modal order-modal">
        <div class="modal-header">
          <h2>{{ t('admin.orderDetails') }}</h2>
          <button class="btn btn-icon" @click="selectedOrder = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="order-info-grid">
            <div class="info-section">
              <h3>{{ t('admin.customer') }}</h3>
              <p><strong>{{ t('customer.name') }}:</strong> {{ selectedOrder.customer.name }}</p>
              <p><strong>{{ t('customer.email') }}:</strong> {{ selectedOrder.customer.email }}</p>
              <p><strong>{{ t('customer.phone') }}:</strong> {{ selectedOrder.customer.phone }}</p>
              <p><strong>{{ t('customer.address') }}:</strong> {{ selectedOrder.customer.address }}, {{ selectedOrder.customer.city }} {{ selectedOrder.customer.zip }}</p>
            </div>
            
            <div class="info-section">
              <h3>{{ t('admin.orderInfo') }}</h3>
              <p><strong>{{ t('admin.orderId') }}:</strong> {{ selectedOrder.id }}</p>
              <p><strong>{{ t('admin.date') }}:</strong> {{ selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : '-' }}</p>
              <p><strong>{{ t('admin.status') }}:</strong> <span class="status" :class="selectedOrder.status">{{ selectedOrder.status }}</span></p>
            </div>
          </div>
          
          <div class="order-items">
            <h3>{{ t('admin.items') }}</h3>
            <div class="order-item" v-for="(item, index) in selectedOrder.items" :key="index">
              <img :src="item.image" :alt="item.name" class="item-image">
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p class="item-variants" v-if="item.variants">
                  <span v-for="(value, key) in item.variants" :key="key" class="variant-tag">
                    {{ key }}: {{ value }}
                  </span>
                </p>
              </div>
              <div class="item-qty">x{{ item.quantity }}</div>
              <div class="item-price">{{ formatPrice(item.price * item.quantity) }}</div>
            </div>
          </div>
          
          <div class="order-total">
            <span>{{ t('cart.total') }}:</span>
            <strong>{{ formatPrice(selectedOrder.total) }}</strong>
          </div>
          
          <div v-if="selectedOrder.customer.notes" class="order-notes">
            <h3>{{ t('customer.notes') }}</h3>
            <p>{{ selectedOrder.customer.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'
import type { Order } from '@/types'

const ordersStore = useOrdersStore()
const { t } = useI18n()

const statusFilter = ref('')
const searchQuery = ref('')
const selectedOrder = ref<Order | null>(null)

onMounted(async () => {
  await ordersStore.fetchOrders()
})

const filteredOrders = computed(() => {
  let orders = [...ordersStore.orders]
  
  if (statusFilter.value) {
    orders = orders.filter(o => o.status === statusFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    orders = orders.filter(o => 
      o.customer.name.toLowerCase().includes(query) ||
      o.customer.email.toLowerCase().includes(query) ||
      o.id.toLowerCase().includes(query)
    )
  }
  
  return orders.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })
})

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleStatusChange(order: Order) {
  await ordersStore.updateOrderStatus(order.id, order.status)
}

function viewOrder(order: Order) {
  selectedOrder.value = order
}
</script>

<style scoped lang="scss">
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .search {
    position: relative;
    flex: 1;
    max-width: 300px;
    
    input {
      padding-left: 2.5rem;
    }
    
    i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted-color);
    }
  }
}

.orders-table-wrapper {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
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
    background: var(--bg-darker);
    color: var(--muted-color);
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  code {
    background: var(--bg-darker);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
}

.customer-info {
  display: flex;
  flex-direction: column;
  
  small {
    color: var(--muted-color);
    font-size: 0.75rem;
  }
}

.status-select {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.order-modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  background: var(--card-bg);
}

.modal-body {
  padding: 1.5rem;
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-section {
  h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: var(--primary-color);
  }
  
  p {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
}

.order-items {
  h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-darker);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  
  h4 {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
}

.item-variants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.variant-tag {
  font-size: 0.7rem;
  background: var(--card-bg);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  color: var(--muted-color);
}

.item-qty {
  color: var(--muted-color);
  font-size: 0.875rem;
}

.item-price {
  font-weight: 600;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  margin-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 1.25rem;
}

.order-notes {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-darker);
  border-radius: 8px;
  
  h3 {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
    color: var(--muted-color);
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
  padding: 4rem;
  color: var(--muted-color);
  
  i {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
}
</style>
