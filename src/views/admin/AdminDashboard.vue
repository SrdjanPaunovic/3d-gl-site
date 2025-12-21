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

    <!-- Email Test Section -->
    <div class="dashboard-section email-test-section">
      <div class="section-header">
        <h2><i class="fas fa-envelope"></i> Test Email Servisa</h2>
      </div>
      
      <div class="email-test-content">
        <div class="email-config-status" :class="{ configured: emailConfig.configured, 'not-configured': !emailConfig.configured }">
          <i :class="emailConfig.configured ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
          <span v-if="emailConfig.configured">EmailJS je konfigurisan</span>
          <span v-else>
            Nedostaju: {{ emailConfig.missing.join(', ') }}
          </span>
        </div>
        
        <div class="email-test-form">
          <div class="form-group">
            <label>Test email adresa</label>
            <input 
              v-model="testEmail" 
              type="email" 
              class="form-control" 
              placeholder="vas@email.com"
            >
          </div>
          
          <div class="test-buttons">
            <button 
              class="btn btn-secondary" 
              @click="testCustomerEmail" 
              :disabled="!emailConfig.configured || testingCustomer || !testEmail"
            >
              <i v-if="testingCustomer" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-user"></i>
              Test Customer Template
            </button>
            
            <button 
              class="btn btn-secondary" 
              @click="testAdminEmail" 
              :disabled="!emailConfig.configured || testingAdmin || !testEmail"
            >
              <i v-if="testingAdmin" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-user-shield"></i>
              Test Admin Template
            </button>
            
            <button 
              class="btn btn-primary" 
              @click="testBothEmails" 
              :disabled="!emailConfig.configured || testingBoth || !testEmail"
            >
              <i v-if="testingBoth" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-paper-plane"></i>
              Test Oba
            </button>
          </div>
          
          <div v-if="emailTestResult" class="test-result" :class="emailTestResult.type">
            <i :class="emailTestResult.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            {{ emailTestResult.message }}
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'
import { isEmailConfigured, sendCustomerEmail, sendAdminEmail, sendTestEmails } from '@/utils/email'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const { t } = useI18n()

// Email test state
const testEmail = ref('')
const testingCustomer = ref(false)
const testingAdmin = ref(false)
const testingBoth = ref(false)
const emailTestResult = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const emailConfig = isEmailConfigured()

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(),
    ordersStore.fetchOrders()
  ])
})

const testOrderData = computed(() => ({
  orderNumber: 'TEST-' + Date.now(),
  customerName: 'Test Korisnik',
  customerEmail: testEmail.value,
  customerPhone: '+381 60 123 4567',
  customerAddress: 'Testna ulica 123',
  customerCity: 'Beograd',
  customerZip: '11000',
  items: [
    { name: 'Test Proizvod 1', quantity: 2, price: 1500, variants: 'Crna, L' },
    { name: 'Test Proizvod 2', quantity: 1, price: 2500 }
  ],
  total: 5500,
  notes: 'Ovo je test porudžbina'
}))

async function testCustomerEmail() {
  testingCustomer.value = true
  emailTestResult.value = null
  
  try {
    await sendCustomerEmail(testOrderData.value)
    emailTestResult.value = { type: 'success', message: 'Customer email uspešno poslat!' }
  } catch (error) {
    emailTestResult.value = { type: 'error', message: `Greška: ${error instanceof Error ? error.message : 'Unknown'}` }
  } finally {
    testingCustomer.value = false
  }
}

async function testAdminEmail() {
  testingAdmin.value = true
  emailTestResult.value = null
  
  try {
    await sendAdminEmail(testOrderData.value)
    emailTestResult.value = { type: 'success', message: 'Admin email uspešno poslat!' }
  } catch (error) {
    emailTestResult.value = { type: 'error', message: `Greška: ${error instanceof Error ? error.message : 'Unknown'}` }
  } finally {
    testingAdmin.value = false
  }
}

async function testBothEmails() {
  testingBoth.value = true
  emailTestResult.value = null
  
  try {
    const result = await sendTestEmails(testEmail.value)
    
    if (result.customer && result.admin) {
      emailTestResult.value = { type: 'success', message: 'Oba emaila uspešno poslata!' }
    } else if (result.errors.length > 0) {
      emailTestResult.value = { type: 'error', message: result.errors.join('; ') }
    }
  } catch (error) {
    emailTestResult.value = { type: 'error', message: `Greška: ${error instanceof Error ? error.message : 'Unknown'}` }
  } finally {
    testingBoth.value = false
  }
}

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

/* Email Test Section */
.email-test-section {
  .section-header h2 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    i {
      color: var(--primary-color);
    }
  }
}

.email-test-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.email-config-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &.configured {
    background: rgba(74, 222, 128, 0.1);
    color: var(--success-color);
    border: 1px solid rgba(74, 222, 128, 0.3);
  }
  
  &.not-configured {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
  
  i {
    font-size: 1rem;
  }
}

.email-test-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .form-group {
    max-width: 400px;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--muted-color);
    }
  }
}

.test-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.test-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  max-width: 600px;
  
  &.success {
    background: rgba(74, 222, 128, 0.1);
    color: var(--success-color);
    border: 1px solid rgba(74, 222, 128, 0.3);
  }
  
  &.error {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error-color);
    border: 1px solid rgba(248, 113, 113, 0.3);
  }
  
  i {
    font-size: 1.25rem;
  }
}
</style>
