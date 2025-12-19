<template>
  <main>
    <div class="page-title">
      <h1>{{ t('cart.title') }}</h1>
      <p>{{ t('cart.emptyMessage') }}</p>
    </div>

    <div class="cart-container">
      <!-- Empty Cart State -->
      <div v-if="isEmpty" class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <h2>{{ t('cart.empty') }}</h2>
        <p>{{ t('cart.emptyMessage') }}</p>
        <RouterLink to="/shop" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i>
          {{ t('cart.continueShopping') }}
        </RouterLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-content">
        <div class="cart-items">
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
              <div class="cart-item-variants">{{ formatVariants(item.variants) }}</div>
              <div class="cart-item-price">{{ formatPrice(item.price * item.quantity) }}</div>
            </div>
            <div class="cart-item-actions">
              <div class="quantity-control">
                <button 
                  class="quantity-btn" 
                  @click="updateQuantity(item.itemKey, item.quantity - 1)"
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
              <span class="remove-item" @click="removeItem(item.itemKey)">
                <i class="fas fa-trash"></i> {{ t('cart.remove') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="cart-total">
            <span>{{ t('cart.total') }}</span>
            <span class="cart-total-price">{{ formatPrice(total) }}</span>
          </div>
          <div class="cart-actions">
            <RouterLink to="/shop" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i>
              {{ t('cart.continueShopping') }}
            </RouterLink>
            <RouterLink to="/checkout" class="btn btn-primary">
              {{ t('cart.checkout') }}
              <i class="fas fa-arrow-right"></i>
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
const total = computed(() => cartStore.total)
const isEmpty = computed(() => cartStore.isEmpty)

const { updateQuantity, removeItem, formatVariants } = cartStore
</script>

<style scoped lang="scss">
.cart-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  .btn {
    flex: 1;
  }
}
</style>
