<template>
  <main>
    <div class="page-title">
      <h1>{{ t('checkout.title') }}</h1>
      <p>Završite vašu porudžbinu</p>
    </div>

    <div class="checkout-container">
      <!-- Empty Cart Redirect -->
      <div v-if="isEmpty && !orderSuccess" class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <h2>{{ t('cart.empty') }}</h2>
        <p>Dodajte proizvode u korpu pre naručivanja.</p>
        <RouterLink to="/shop" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i>
          {{ t('nav.shop') }}
        </RouterLink>
      </div>

      <!-- Checkout Form -->
      <div v-else-if="!orderSuccess" class="checkout-content">
        <!-- Order Summary -->
        <div class="order-summary">
          <h3><i class="fas fa-receipt"></i> {{ t('checkout.orderSummary') }}</h3>
          <div class="order-items">
            <div v-for="item in items" :key="item.itemKey" class="order-item">
              <span class="order-item-name">
                {{ item.name }} 
                <template v-if="formatVariants(item.variants)">({{ formatVariants(item.variants) }})</template>
                × {{ item.quantity }}
              </span>
              <span>{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
          <div class="order-total">
            <span>{{ t('cart.total') }}</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>

        <!-- Customer Information Form -->
        <form class="checkout-form" @submit.prevent="submitOrder">
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
              placeholder="Posebne instrukcije za dostavu..."
            ></textarea>
          </div>

          <div class="alert alert-warning">
            <i class="fas fa-info-circle"></i>
            <strong>{{ t('checkout.cashOnDelivery') }}</strong> {{ t('checkout.cashOnDeliveryDesc') }}
          </div>

          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div class="checkout-actions">
            <RouterLink to="/cart" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i>
              Nazad u korpu
            </RouterLink>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <template v-if="submitting">
                <div class="spinner spinner-sm"></div>
              </template>
              <template v-else>
                <i class="fas fa-check"></i>
                {{ t('checkout.placeOrder') }}
              </template>
            </button>
          </div>
        </form>
      </div>

      <!-- Success State -->
      <div v-else class="success-container">
        <i class="fas fa-check-circle success-icon"></i>
        <h1>{{ t('checkout.orderSuccess') }}</h1>
        <p>{{ t('checkout.orderSuccessMessage') }}</p>
        <div class="order-number">{{ orderNumber }}</div>
        <p class="success-note">
          Dobićete email sa potvrdom kada vaša porudžbina bude odobrena.
        </p>
        <RouterLink to="/shop" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i>
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
.checkout-content {
  display: grid;
  gap: 2rem;
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.order-total {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-weight: 700;
  font-size: 1.1rem;
}

.checkout-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  
  .btn {
    flex: 1;
  }
}

.success-container {
  text-align: center;
  padding: 4rem 2rem;
  
  .success-icon {
    font-size: 5rem;
    color: var(--success-color);
    margin-bottom: 1.5rem;
  }
  
  h1 {
    margin-bottom: 1rem;
  }
  
  .order-number {
    font-size: 1.25rem;
    color: var(--primary-color);
    font-weight: 600;
    margin: 1rem 0;
  }
  
  .success-note {
    color: var(--muted-color);
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}
</style>
