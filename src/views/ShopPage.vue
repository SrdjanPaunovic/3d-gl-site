<template>
  <main class="shop-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-bg"></div>
      <div class="page-header-content">
        <span class="page-badge">🛒 {{ t('shop.title') }}</span>
        <h1>{{ t('shop.title') }}</h1>
        <p>{{ t('shop.subtitle') || 'Pronađite savršen 3D print za sebe' }}</p>
      </div>
    </div>

    <div class="shop-content container">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <span>{{ t('common.loading') || 'Učitavanje proizvoda...' }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="empty-state">
        <i class="fas fa-box-open"></i>
        <h2>{{ t('shop.noProducts') }}</h2>
        <p>Vratite se uskoro po nove artikle!</p>
        <RouterLink to="/" class="btn btn-primary">
          <i class="fas fa-home"></i>
          {{ t('nav.home') }}
        </RouterLink>
      </div>

      <!-- Products Grid -->
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

<style scoped lang="scss">
.shop-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  position: relative;
  padding: 4rem 2rem;
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
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.page-header p {
  font-size: 1.1rem;
  color: var(--muted-color);
  margin: 0;
}

.shop-content {
  flex: 1;
  padding: 2rem 1rem 4rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: var(--muted-color);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  
  i {
    font-size: 4rem;
    color: var(--muted-color);
    margin-bottom: 1.5rem;
    display: block;
  }
  
  h2 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--muted-color);
    margin-bottom: 1.5rem;
  }
}
</style>
