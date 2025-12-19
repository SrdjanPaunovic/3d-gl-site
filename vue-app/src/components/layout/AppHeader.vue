<template>
  <header class="header">
    <div class="header-content">
      <RouterLink to="/" class="logo">
        <i class="fas fa-cube"></i>
        <span>3D Gadgets Lab</span>
      </RouterLink>
      
      <nav class="nav">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/shop">{{ t('nav.shop') }}</RouterLink>
        <RouterLink to="/cart" class="cart-icon">
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
import { computed, ref, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useI18n } from '@/i18n'

const cartStore = useCartStore()
const { t, setLanguage, language } = useI18n()

const cartCount = computed(() => cartStore.count)
const currentLanguage = ref(language.value)

watch(currentLanguage, (newLang) => {
  setLanguage(newLang)
})

function changeLanguage() {
  setLanguage(currentLanguage.value)
}
</script>
