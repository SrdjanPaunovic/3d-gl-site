<template>
  <main class="order-tracking-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-bg"></div>
      <div class="page-header-content">
        <span class="page-badge">📦 Praćenje porudžbine</span>
        <h1>Status porudžbine</h1>
        <p>Unesite broj porudžbine da vidite status</p>
      </div>
    </div>

    <div class="tracking-container container">
      <!-- Search Form -->
      <div v-if="!order" class="search-section">
        <form @submit.prevent="searchOrder" class="search-form">
          <div class="form-group">
            <label for="orderNumber">Broj porudžbine</label>
            <div class="search-input-wrapper">
              <input
                v-model="searchQuery"
                type="text"
                id="orderNumber"
                class="form-control"
                placeholder="npr. ORD-1234567890"
                :disabled="loading"
              >
              <button type="submit" class="btn btn-primary" :disabled="loading || !searchQuery.trim()">
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-search"></i>
                Pretraži
              </button>
            </div>
          </div>
          <p v-if="error" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </p>
        </form>
      </div>

      <!-- Order Details -->
      <div v-else class="order-details">
        <button @click="clearOrder" class="btn btn-secondary back-btn">
          <i class="fas fa-arrow-left"></i>
          Nova pretraga
        </button>

        <div class="order-header">
          <div class="order-number">
            <span class="label">Porudžbina</span>
            <span class="value">#{{ order.orderNumber }}</span>
          </div>
          <div class="order-status" :class="statusClass">
            <i :class="statusIcon"></i>
            {{ statusText }}
          </div>
        </div>

        <div class="order-content">
          <!-- Order Items -->
          <div class="order-section">
            <h3><i class="fas fa-shopping-bag"></i> Proizvodi</h3>
            <div class="order-items">
              <div v-for="item in order.items" :key="item.productId" class="order-item">
                <img 
                  :src="item.image || 'https://via.placeholder.com/80x80?text=No+Image'" 
                  :alt="item.name"
                  class="item-image"
                >
                <div class="item-details">
                  <span class="item-name">{{ item.name }}</span>
                  <span v-if="formatVariants(item.variants)" class="item-variants">
                    {{ formatVariants(item.variants) }}
                  </span>
                  <span class="item-quantity">Količina: {{ item.quantity }}</span>
                </div>
                <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-section">
            <h3><i class="fas fa-receipt"></i> Pregled</h3>
            <div class="summary-rows">
              <div class="summary-row">
                <span>Međuzbir</span>
                <span>{{ formatPrice(order.subtotal || order.total) }}</span>
              </div>
              <div v-if="order.shipping !== undefined" class="summary-row">
                <span>Dostava</span>
                <span>{{ order.shipping === 0 ? 'Besplatna' : formatPrice(order.shipping) }}</span>
              </div>
              <div class="summary-row total">
                <span>Ukupno</span>
                <span>{{ formatPrice(order.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="order-section">
            <h3><i class="fas fa-map-marker-alt"></i> Adresa za dostavu</h3>
            <div class="address-info">
              <p><strong>{{ order.customer.name }}</strong></p>
              <p>{{ order.customer.address }}</p>
              <p>{{ order.customer.city }} {{ order.customer.zip }}</p>
              <p><i class="fas fa-phone"></i> {{ order.customer.phone }}</p>
              <p><i class="fas fa-envelope"></i> {{ order.customer.email }}</p>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="order.customer.notes" class="order-section">
            <h3><i class="fas fa-sticky-note"></i> Napomena</h3>
            <p class="notes">{{ order.customer.notes }}</p>
          </div>

          <!-- Order Date -->
          <div class="order-section">
            <h3><i class="fas fa-calendar"></i> Datum porudžbine</h3>
            <p>{{ formatDate(order.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { formatPrice } from '@/utils/format'
import type { Order, SelectedVariants } from '@/types'

const route = useRoute()

const searchQuery = ref('')
const order = ref<Order | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const statusClass = computed(() => {
  if (!order.value) return ''
  switch (order.value.status) {
    case 'pending': return 'status-pending'
    case 'approved': return 'status-approved'
    case 'completed': return 'status-completed'
    case 'cancelled': return 'status-cancelled'
    default: return ''
  }
})

const statusIcon = computed(() => {
  if (!order.value) return ''
  switch (order.value.status) {
    case 'pending': return 'fas fa-clock'
    case 'approved': return 'fas fa-check-circle'
    case 'completed': return 'fas fa-box-open'
    case 'cancelled': return 'fas fa-times-circle'
    default: return 'fas fa-question-circle'
  }
})

const statusText = computed(() => {
  if (!order.value) return ''
  switch (order.value.status) {
    case 'pending': return 'Na čekanju'
    case 'approved': return 'Odobreno'
    case 'completed': return 'Završeno'
    case 'cancelled': return 'Otkazano'
    default: return order.value.status
  }
})

function formatVariants(variants: SelectedVariants | undefined): string {
  if (!variants) return ''
  return Object.entries(variants)
    .map(([key, val]) => `${key}: ${val.value}`)
    .join(', ')
}

function formatDate(timestamp: any): string {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function searchOrder() {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  error.value = null
  
  try {
    const ordersCollection = collection(db, 'orders')
    const q = query(ordersCollection, where('orderNumber', '==', searchQuery.value.trim()))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      error.value = 'Porudžbina nije pronađena. Proverite broj porudžbine.'
      order.value = null
    } else {
      const doc = snapshot.docs[0]
      order.value = { id: doc.id, ...doc.data() } as Order
    }
  } catch (err) {
    console.error('Error searching order:', err)
    error.value = 'Greška pri pretrazi. Pokušajte ponovo.'
  } finally {
    loading.value = false
  }
}

function clearOrder() {
  order.value = null
  searchQuery.value = ''
  error.value = null
}

onMounted(() => {
  // Check if order ID is in URL
  const orderId = route.query.id as string
  if (orderId) {
    searchQuery.value = orderId
    searchOrder()
  }
})
</script>

<style scoped lang="scss">
.order-tracking-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  position: relative;
  padding: 3rem 2rem;
  text-align: center;
  overflow: hidden;
}

.page-header-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 30% 50%, rgba(78, 141, 245, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 50%, rgba(243, 94, 145, 0.1) 0%, transparent 50%);
  z-index: 0;
}

.page-header-content {
  position: relative;
  z-index: 1;
}

.page-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: rgba(78, 141, 245, 0.1);
  border: 1px solid rgba(78, 141, 245, 0.3);
  border-radius: 50px;
  font-size: 0.85rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--muted-color);
  margin: 0;
}

.tracking-container {
  flex: 1;
  padding: 2rem 1rem 4rem;
  max-width: 800px;
  margin: 0 auto;
}

// Search Section
.search-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
}

.search-form {
  .form-group {
    margin-bottom: 1rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  }
}

.search-input-wrapper {
  display: flex;
  gap: 0.75rem;
  
  .form-control {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--input-bg, #fff);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
  }
}

.error-message {
  color: var(--error-color, #ef4444);
  margin-top: 1rem;
  
  i {
    margin-right: 0.4rem;
  }
}

// Order Details
.order-details {
  .back-btn {
    margin-bottom: 1.5rem;
    
    i {
      margin-right: 0.5rem;
    }
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.order-number {
  .label {
    display: block;
    font-size: 0.85rem;
    color: var(--muted-color);
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.order-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 500;
  
  &.status-pending {
    background: rgba(234, 179, 8, 0.1);
    color: #ca8a04;
  }
  
  &.status-approved {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
  }
  
  &.status-completed {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }
  
  &.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  
  h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    
    i {
      margin-right: 0.5rem;
      color: var(--primary-color);
    }
  }
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg-color, #f9f9f9);
  border-radius: 8px;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 500;
}

.item-variants {
  font-size: 0.85rem;
  color: var(--muted-color);
}

.item-quantity {
  font-size: 0.85rem;
  color: var(--muted-color);
}

.item-price {
  font-weight: 600;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  
  &.total {
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border-color);
    font-weight: 700;
    font-size: 1.1rem;
  }
}

.address-info {
  p {
    margin: 0.25rem 0;
    
    i {
      width: 20px;
      color: var(--muted-color);
    }
  }
}

.notes {
  color: var(--muted-color);
  font-style: italic;
}

@media (max-width: 600px) {
  .search-input-wrapper {
    flex-direction: column;
  }
  
  .order-header {
    flex-direction: column;
    text-align: center;
  }
  
  .order-item {
    flex-wrap: wrap;
  }
}
</style>
