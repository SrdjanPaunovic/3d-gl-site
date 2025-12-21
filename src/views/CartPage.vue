<template>
  <main class="cart-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-bg"></div>
      <div class="page-header-content">
        <span class="page-badge">🛒 {{ t('cart.title') }}</span>
        <h1>{{ t('cart.title') }}</h1>
        <p v-if="!isEmpty">{{ items.length }} {{ items.length === 1 ? 'artikal' : 'artikala' }} u korpi</p>
        <p v-else>{{ t('cart.emptyMessage') }}</p>
      </div>
    </div>

    <div class="cart-container container">
      <!-- Empty Cart State -->
      <div v-if="isEmpty" class="cart-empty">
        <div class="empty-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h2>{{ t('cart.empty') }}</h2>
        <p>{{ t('cart.emptyMessage') }}</p>
        <RouterLink to="/shop" class="btn btn-primary btn-lg">
          <i class="fas fa-shopping-bag"></i>
          {{ t('cart.continueShopping') }}
        </RouterLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <TransitionGroup name="cart-item">
            <div 
              v-for="item in items" 
              :key="item.itemKey" 
              class="cart-item"
            >
              <img 
                :src="item.image || 'https://via.placeholder.com/100x100?text=No+Image'" 
                :alt="item.name" 
                class="cart-item-image"
              >
              <div class="cart-item-details">
                <div class="cart-item-name">{{ item.name }}</div>
                <div v-if="item.variants && Object.keys(item.variants).length" class="cart-item-variants">
                  {{ formatVariants(item.variants) }}
                </div>
                <div class="cart-item-price">{{ formatPrice(item.price) }} × {{ item.quantity }}</div>
              </div>
              <div class="cart-item-subtotal">
                {{ formatPrice(item.price * item.quantity) }}
              </div>
              <div class="cart-item-actions">
                <div class="quantity-control">
                  <button 
                    class="quantity-btn" 
                    @click="updateQuantity(item.itemKey, item.quantity - 1)"
                    :disabled="item.quantity <= 1"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="quantity-value">{{ item.quantity }}</span>
                  <button 
                    class="quantity-btn" 
                    @click="updateQuantity(item.itemKey, item.quantity + 1)"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <button class="remove-btn" @click="removeItem(item.itemKey)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <h3>{{ t('cart.summary') || 'Pregled narudžbine' }}</h3>
          <div class="summary-row">
            <span>Međuzbir</span>
            <span>{{ formatPrice(summary.subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Dostava</span>
            <span v-if="summary.shipping === 0" class="shipping-free">Besplatna</span>
            <span v-else>{{ formatPrice(summary.shipping) }}</span>
          </div>
          <div v-if="summary.amountToFreeShipping > 0" class="free-shipping-hint">
            <i class="fas fa-info-circle"></i>
            Još {{ formatPrice(summary.amountToFreeShipping) }} do besplatne dostave
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row summary-total">
            <span>{{ t('cart.total') }}</span>
            <span>{{ formatPrice(summary.total) }}</span>
          </div>
          <div class="cart-actions">
            <RouterLink to="/checkout" class="btn btn-primary btn-lg">
              {{ t('cart.checkout') }}
              <i class="fas fa-arrow-right"></i>
            </RouterLink>
            <RouterLink to="/shop" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i>
              {{ t('cart.continueShopping') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'

const cartStore = useCartStore()
const { t } = useI18n()

const items = computed(() => cartStore.items)
const summary = computed(() => cartStore.summary)
const isEmpty = computed(() => cartStore.isEmpty)

const { updateQuantity, removeItem, formatVariants } = cartStore
</script>

<style scoped lang="scss">
.cart-page {
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

.cart-container {
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

// Cart Content
.cart-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

// Cart Items
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 1rem;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--card-bg-hover);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 70px 1fr;
    grid-template-rows: auto auto;
    
    .cart-item-subtotal {
      display: none;
    }
    
    .cart-item-actions {
      grid-column: 1 / -1;
      justify-content: space-between;
    }
  }
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  
  @media (max-width: 640px) {
    width: 70px;
    height: 70px;
  }
}

.cart-item-details {
  min-width: 0;
}

.cart-item-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-variants {
  font-size: 0.85rem;
  color: var(--muted-color);
  margin-bottom: 0.25rem;
}

.cart-item-price {
  font-size: 0.9rem;
  color: var(--primary-color);
}

.cart-item-subtotal {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  text-align: right;
  min-width: 100px;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.25rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: var(--card-bg-hover);
    color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  i {
    font-size: 0.75rem;
  }
}

.quantity-value {
  width: 30px;
  text-align: center;
  font-weight: 600;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(248, 113, 113, 0.1);
  color: var(--error-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(248, 113, 113, 0.2);
  }
}

// Cart Summary
.cart-summary {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  position: sticky;
  top: 100px;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  .shipping-free {
    color: var(--success-color, #22c55e);
    font-weight: 500;
  }
}

.free-shipping-hint {
  font-size: 0.8rem;
  color: var(--primary-color);
  background: rgba(78, 141, 245, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  
  i {
    margin-right: 0.4rem;
  }
}

.summary-divider {
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
}

.summary-total {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  
  span:last-child {
    color: var(--primary-color);
  }
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

// Transitions
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
