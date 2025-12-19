<template>
  <main class="home-page">
    <section class="hero">
      <div class="hero-content">
        <h1>3D Gadgets Lab</h1>
        <p>Jedinstveni 3D štampani proizvodi za vaš dom i kancelariju</p>
        <RouterLink to="/shop" class="btn btn-primary btn-lg">
          <i class="fas fa-shopping-bag"></i>
          {{ t('nav.shop') }}
        </RouterLink>
      </div>
    </section>
    
    <section class="featured-section container">
      <h2>Popularni proizvodi</h2>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      <div v-else class="products-grid">
        <ProductCard 
          v-for="product in featuredProducts" 
          :key="product.id" 
          :product="product" 
        />
      </div>
    </section>
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
const featuredProducts = computed(() => productsStore.products.slice(0, 4))

onMounted(() => {
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts()
  }
})
</script>

<style scoped lang="scss">
.hero {
  background: linear-gradient(135deg, rgba(78, 141, 245, 0.2), rgba(243, 94, 145, 0.2));
  padding: 6rem 2rem;
  text-align: center;
  
  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.25rem;
    color: var(--muted-color);
    margin-bottom: 2rem;
  }
}

.featured-section {
  padding: 4rem 1rem;
  
  h2 {
    text-align: center;
    margin-bottom: 2rem;
  }
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}
</style>
