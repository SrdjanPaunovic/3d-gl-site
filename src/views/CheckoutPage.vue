<template>
  <main class="checkout-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-bg"></div>
      <div class="page-header-content">
        <span class="page-badge">📦 {{ t('checkout.title') }}</span>
        <h1>{{ t('checkout.title') }}</h1>
        <p>Završite vašu porudžbinu</p>
      </div>
    </div>

    <div class="checkout-container container">
      <!-- Empty Cart Redirect -->
      <div v-if="isEmpty && !orderSuccess" class="cart-empty">
        <div class="empty-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h2>{{ t('cart.empty') }}</h2>
        <p>Dodajte proizvode u korpu pre naručivanja.</p>
        <RouterLink to="/shop" class="btn btn-primary btn-lg">
          <i class="fas fa-shopping-bag"></i>
          {{ t('nav.shop') }}
        </RouterLink>
      </div>

      <!-- Checkout Form -->
      <div v-else-if="!orderSuccess" class="checkout-content">
        <!-- Customer Information Form -->
        <div class="checkout-form-wrapper">
          <form class="checkout-form" @submit.prevent="submitOrder">
            <div class="form-section">
              <h3><i class="fas fa-user"></i> {{ t('checkout.customerInfo') }}</h3>
              
              <div class="form-group">
                <label for="name">{{ t('checkout.firstName') }} i {{ t('checkout.lastName') }} <span class="required">*</span></label>
                <input 
                  v-model="customer.name" 
                  type="text" 
                  id="name" 
                  class="form-control" 
                  required
                  placeholder="Unesite ime i prezime"
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email">{{ t('checkout.email') }} <span class="required">*</span></label>
                  <input 
                    v-model="customer.email" 
                    type="email" 
                    id="email" 
                    class="form-control" 
                    required
                    placeholder="vas@email.com"
                  >
                </div>
                <div class="form-group">
                  <label for="phone">{{ t('checkout.phone') }} <span class="required">*</span></label>
                  <input 
                    v-model="customer.phone" 
                    type="tel" 
                    id="phone" 
                    class="form-control" 
                    required
                    placeholder="+381 XX XXX XXXX"
                  >
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3><i class="fas fa-map-marker-alt"></i> Adresa za dostavu</h3>
              
              <div class="form-group">
                <label for="address">{{ t('checkout.address') }} <span class="required">*</span></label>
                <input 
                  v-model="customer.address" 
                  type="text" 
                  id="address" 
                  class="form-control" 
                  required
                  placeholder="Ulica i broj"
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">{{ t('checkout.city') }} <span class="required">*</span></label>
                  <input 
                    v-model="customer.city" 
                    type="text" 
                    id="city" 
                    class="form-control" 
                    required
                    placeholder="Grad"
                  >
                </div>
                <div class="form-group">
                  <label for="zip">{{ t('checkout.zipCode') }}</label>
                  <input 
                    v-model="customer.zip" 
                    type="text" 
                    id="zip" 
                    class="form-control"
                    placeholder="Poštanski broj"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="notes">{{ t('checkout.notes') }}</label>
                <textarea 
                  v-model="customer.notes" 
                  id="notes" 
                  class="form-control"
                  rows="3"
                  placeholder="Posebne instrukcije za dostavu..."
                ></textarea>
              </div>
            </div>

            <div class="payment-info">
              <i class="fas fa-money-bill-wave"></i>
              <div>
                <strong>{{ t('checkout.cashOnDelivery') }}</strong>
                <p>{{ t('checkout.cashOnDeliveryDesc') }}</p>
              </div>
            </div>

            <div v-if="error" class="alert alert-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ error }}
            </div>

            <div class="checkout-actions">
              <RouterLink to="/cart" class="btn btn-secondary">
                <i class="fas fa-arrow-left"></i>
                Nazad u korpu
              </RouterLink>
              <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting">
                <template v-if="submitting">
                  <div class="spinner spinner-sm"></div>
                  Slanje...
                </template>
                <template v-else>
                  <i class="fas fa-check"></i>
                  {{ t('checkout.placeOrder') }}
                </template>
              </button>
            </div>
          </form>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="order-summary">
          <h3><i class="fas fa-receipt"></i> {{ t('checkout.orderSummary') }}</h3>
          <div class="order-items">
            <div v-for="item in items" :key="item.itemKey" class="order-item">
              <div class="order-item-image">
                <img :src="item.image || 'https://via.placeholder.com/60'" :alt="item.name">
                <span class="order-item-qty">{{ item.quantity }}</span>
              </div>
              <div class="order-item-info">
                <span class="order-item-name">{{ item.name }}</span>
                <span v-if="formatVariants(item.variants)" class="order-item-variants">
                  {{ formatVariants(item.variants) }}
                </span>
              </div>
              <span class="order-item-price">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
          <div class="order-summary-divider"></div>
          <div class="order-subtotal">
            <span>Ukupno</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
          <div class="order-shipping">
            <span>Dostava</span>
            <span class="shipping-tbd">Izračunava se</span>
          </div>
          <div class="order-summary-divider"></div>
          <div class="order-total">
            <span>{{ t('cart.total') }}</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else class="success-container">
        <div class="success-icon-wrapper">
          <i class="fas fa-check"></i>
        </div>
        <h1>{{ t('checkout.orderSuccess') }}</h1>
        <p class="success-message">{{ t('checkout.orderSuccessMessage') }}</p>
        <div class="order-number">
          <span>Broj narudžbine:</span>
          <strong>{{ orderNumber }}</strong>
        </div>
        <p class="success-note">
          <i class="fas fa-envelope"></i>
          Dobićete email sa potvrdom kada vaša porudžbina bude odobrena.
        </p>
        <RouterLink to="/shop" class="btn btn-primary btn-lg">
          <i class="fas fa-shopping-bag"></i>
          {{ t('cart.continueShopping') }}
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'
import type { Customer } from '@/types'

const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const { t } = useI18n()

const items = computed(() => cartStore.items)
const total = computed(() => cartStore.total)
const isEmpty = computed(() => cartStore.isEmpty)
const { formatVariants } = cartStore

const customer = reactive<Customer>({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  notes: ''
})

const submitting = ref(false)
const error = ref<string | null>(null)
const orderSuccess = ref(false)
const orderNumber = ref('')

async function submitOrder() {
  submitting.value = true
  error.value = null

  try {
    const result = await ordersStore.createOrder(customer, cartStore.items, cartStore.total)
    orderNumber.value = result.orderNumber
    orderSuccess.value = true
    cartStore.clearCart()
  } catch (err: any) {
    error.value = err.message || 'Failed to create order. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.checkout-page {
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

.checkout-container {
  flex: 1;
  padding: 2rem 1rem 4rem;
}

// Empty Cart
.cart-empty {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  max-width: 500px;
  margin: 0 auto;
  
  .empty-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: rgba(78, 141, 245, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 2.5rem;
      color: var(--muted-color);
    }
  }
  
  h2 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--muted-color);
    margin-bottom: 2rem;
  }
}

// Checkout Content
.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

// Form Wrapper
.checkout-form-wrapper {
  order: 1;
  
  @media (max-width: 1024px) {
    order: 2;
  }
}

.checkout-form {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    i {
      color: var(--primary-color);
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    
    .required {
      color: var(--error-color);
    }
  }
}

.payment-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  
  i {
    font-size: 1.5rem;
    color: var(--success-color);
    margin-top: 0.25rem;
  }
  
  strong {
    display: block;
    margin-bottom: 0.25rem;
    color: var(--success-color);
  }
  
  p {
    font-size: 0.9rem;
    color: var(--muted-color);
    margin: 0;
  }
}

.checkout-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  .btn-secondary {
    flex: 0 0 auto;
  }
  
  .btn-primary {
    flex: 1;
  }
  
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    
    .btn {
      width: 100%;
    }
  }
}

// Order Summary
.order-summary {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  position: sticky;
  top: 100px;
  order: 2;
  
  @media (max-width: 1024px) {
    order: 1;
    position: static;
  }
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    
    i {
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
}

.order-item-image {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.order-item-qty {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-item-info {
  flex: 1;
  min-width: 0;
}

.order-item-name {
  display: block;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-item-variants {
  display: block;
  font-size: 0.8rem;
  color: var(--muted-color);
}

.order-item-price {
  font-weight: 600;
  font-size: 0.9rem;
}

.order-summary-divider {
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
}

.order-subtotal,
.order-shipping {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--muted-color);
  margin-bottom: 0.5rem;
}

.shipping-tbd {
  font-style: italic;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: 700;
  
  span:last-child {
    color: var(--primary-color);
  }
}

// Success State
.success-container {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.success-icon-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, var(--success-color), #22c55e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.5s ease;
  
  i {
    font-size: 3rem;
    color: white;
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-container h1 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: var(--success-color);
}

.success-message {
  font-size: 1.1rem;
  color: var(--muted-color);
  margin-bottom: 2rem;
}

.order-number {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  
  span {
    color: var(--muted-color);
  }
  
  strong {
    font-size: 1.25rem;
    color: var(--primary-color);
  }
}

.success-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--muted-color);
  font-size: 0.9rem;
  margin-bottom: 2rem;
  
  i {
    color: var(--primary-color);
  }
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  
  i {
    margin-top: 0.15rem;
  }
}

.alert-error {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: var(--error-color);
}
</style>
