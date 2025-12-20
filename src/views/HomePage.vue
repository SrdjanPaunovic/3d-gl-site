<template>
  <main class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="hero-badge">🚀 Handcrafted 3D Prints</span>
        <h1 class="hero-title">
          <span class="gradient-text">3D Gadgets</span>
          <span>Lab</span>
        </h1>
        <p class="hero-description">
          {{ t('hero.description') || 'Jedinstveni 3D štampani proizvodi za vaš dom i kancelariju' }}
        </p>
        <div class="hero-actions">
          <RouterLink to="/shop" class="btn btn-primary btn-lg">
            <i class="fas fa-shopping-bag"></i>
            {{ t('nav.shop') }}
          </RouterLink>
          <a href="#featured" class="btn btn-secondary btn-lg">
            <i class="fas fa-arrow-down"></i>
            {{ t('hero.explore') || 'Istraži' }}
          </a>
        </div>
      </div>
    </section>
    
    <!-- Featured Products Section -->
    <section id="featured" class="featured-section">
      <div class="container">
        <div class="section-header">
          <span class="section-badge">⭐ Popularno</span>
          <h2>{{ t('home.featured') || 'Popularni proizvodi' }}</h2>
          <p>{{ t('home.featuredSubtitle') || 'Naši najprodavaniji 3D štampani proizvodi' }}</p>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <span>{{ t('common.loading') || 'Učitavanje...' }}</span>
        </div>
        
        <div v-else-if="featuredProducts.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <h3>{{ t('shop.noProducts') || 'Nema proizvoda' }}</h3>
        </div>
        
        <div v-else class="products-grid">
          <ProductCard 
            v-for="product in featuredProducts" 
            :key="product.id" 
            :product="product" 
          />
        </div>
        
        <div class="section-cta">
          <RouterLink to="/shop" class="btn btn-secondary">
            {{ t('home.viewAll') || 'Pogledaj sve proizvode' }}
            <i class="fas fa-arrow-right"></i>
          </RouterLink>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-print"></i>
            </div>
            <h3>{{ t('features.quality') || 'Premium Kvalitet' }}</h3>
            <p>{{ t('features.qualityDesc') || 'Visokokvalitetni 3D print sa preciznošću do 0.1mm' }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-truck"></i>
            </div>
            <h3>{{ t('features.shipping') || 'Brza Dostava' }}</h3>
            <p>{{ t('features.shippingDesc') || 'Dostava u roku od 3-5 radnih dana' }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-palette"></i>
            </div>
            <h3>{{ t('features.colors') || 'Razne Boje' }}</h3>
            <p>{{ t('features.colorsDesc') || 'Izaberite boju koja odgovara vašem stilu' }}</p>
          </div>
        </div>
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
.home-page {
  flex: 1;
}

// Hero Section
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(78, 141, 245, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(243, 94, 145, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: rgba(78, 141, 245, 0.1);
  border: 1px solid rgba(78, 141, 245, 0.3);
  border-radius: 50px;
  font-size: 0.9rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  
  .gradient-text {
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-description {
  font-size: 1.35rem;
  color: var(--muted-color);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

// Featured Section
.featured-section {
  padding: 5rem 0;
  background: rgba(0, 0, 0, 0.2);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.25rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--muted-color);
    font-size: 1.1rem;
  }
}

.section-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  background: rgba(243, 94, 145, 0.1);
  border: 1px solid rgba(243, 94, 145, 0.3);
  border-radius: 50px;
  font-size: 0.8rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.section-cta {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}

// Features Section
.features-section {
  padding: 5rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
}

.feature-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    font-size: 1.75rem;
    color: white;
  }
}

.feature-card h3 {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}

.feature-card p {
  color: var(--muted-color);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

// Loading
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: var(--muted-color);
}
</style>
