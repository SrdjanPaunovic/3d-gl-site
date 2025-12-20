<template>
  <header class="header" :class="{ 'header--scrolled': isScrolled }">
    <div class="header-content">
      <RouterLink to="/" class="logo">
        <i class="fas fa-cube"></i>
        <span>3D Gadgets Lab</span>
      </RouterLink>
      
      <nav class="nav">
        <RouterLink to="/" class="nav-link">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/shop" class="nav-link">{{ t('nav.shop') }}</RouterLink>
        <RouterLink to="/cart" class="cart-link">
          <i class="fas fa-shopping-cart"></i>
          <span v-if="cartCount > 0" class="cart-count">{{ cartCount }}</span>
        </RouterLink>
        <div class="lang-switcher-wrapper">
          <select 
            v-model="currentLanguage" 
            class="lang-switcher"
            @change="changeLanguage"
          >
            <option value="sr">🇷🇸 SR</option>
            <option value="en">🇬🇧 EN</option>
          </select>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useI18n } from '@/i18n'

const cartStore = useCartStore()
const { t, setLanguage, language } = useI18n()

const cartCount = computed(() => cartStore.count)
const currentLanguage = ref(language.value)
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(currentLanguage, (newLang) => {
  setLanguage(newLang)
})

function changeLanguage() {
  setLanguage(currentLanguage.value)
}
</script>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1rem 2rem;
  background: transparent;
  transition: all 0.3s ease;
  
  &--scrolled {
    background: rgba(11, 15, 29, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s ease;
  
  i {
    font-size: 1.75rem;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  &:hover {
    color: var(--primary-color);
  }
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  transition: color 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
    transition: width 0.3s ease;
  }
  
  &:hover,
  &.router-link-active {
    color: var(--primary-color);
    
    &::after {
      width: 100%;
    }
  }
}

.cart-link {
  position: relative;
  color: var(--text-color);
  font-size: 1.25rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
  }
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -12px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.lang-switcher-wrapper {
  position: relative;
}

.lang-switcher {
  appearance: none;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    background: rgba(78, 141, 245, 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  option {
    background: var(--bg-color);
    color: var(--text-color);
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }
  
  .logo span {
    display: none;
  }
  
  .nav {
    gap: 1.25rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
  }
}
</style>
