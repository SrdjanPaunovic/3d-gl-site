<template>
  <main>
    <div class="page-title">
      <h1>{{ t('shop.title') }}</h1>
      <p>{{ t('shop.subtitle') }}</p>
    </div>

    <div class="container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="products.length === 0" class="cart-empty">
        <i class="fas fa-box-open"></i>
        <h2>{{ t('shop.noProducts') }}</h2>
        <p>Vratite se uskoro po nove artikle!</p>
      </div>

      <div v-else class="products-grid">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useI18n } from '@/i18n'
import ProductCard from '@/components/shop/ProductCard.vue'

const productsStore = useProductsStore()
const { t } = useI18n()

const loading = computed(() => productsStore.loading)
const products = computed(() => productsStore.products)

onMounted(() => {
  productsStore.fetchProducts()
})
</script>
