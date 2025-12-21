<template>
  <div class="product-card">
    <div class="product-image-container" @click="openLightbox">
      <img 
        :src="currentImage" 
        :alt="product.name" 
        class="product-image" 
        :style="{ objectPosition: currentImagePosition }"
        loading="lazy"
      >
      <button class="zoom-btn" @click.stop="openLightbox" title="View larger">
        <i class="fas fa-search-plus"></i>
      </button>
      <div v-if="product.images?.length > 1" class="product-thumbnails" @click.stop>
        <button
          v-for="(img, index) in product.images"
          :key="index"
          class="product-thumbnail"
          :class="{ active: currentImageIndex === index }"
          @click="currentImageIndex = index"
        >
          <img 
            :src="getImageUrl(img)" 
            :alt="`Thumbnail ${index + 1}`" 
            :style="{ objectPosition: getImagePosition(img) }"
            loading="lazy"
          >
        </button>
      </div>
    </div>
    
    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox-overlay">
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="closeLightbox">
            <i class="fas fa-times"></i>
          </button>
          <button v-if="product.images?.length > 1" class="lightbox-nav prev" @click="prevImage">
            <i class="fas fa-chevron-left"></i>
          </button>
          <img 
            :src="currentImage" 
            :alt="product.name" 
            class="lightbox-image"
          >
          <button v-if="product.images?.length > 1" class="lightbox-nav next" @click="nextImage">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div v-if="product.images?.length > 1" class="lightbox-thumbnails">
            <button
              v-for="(img, index) in product.images"
              :key="index"
              class="lightbox-thumb"
              :class="{ active: currentImageIndex === index }"
              @click="currentImageIndex = index"
            >
              <img :src="getImageUrl(img)" :alt="`Thumbnail ${index + 1}`">
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price">{{ formatPrice(displayPrice) }}</div>
      
      <!-- Variants -->
      <div v-if="hasVariants" class="product-variants">
        <div 
          v-for="variant in variantEntries" 
          :key="variant.name"
          class="variant-group"
        >
          <div class="variant-label">{{ variant.name }}</div>
          <div class="variant-options">
            <template v-for="item in variant.values" :key="getValue(item)">
              <!-- Color variant -->
              <button
                v-if="variant.isColor && getColorHex(item)"
                class="variant-option color-option"
                :class="{ selected: isSelected(variant.name, item) }"
                :style="{ backgroundColor: getColorHex(item) }"
                :title="getVariantTitle(item)"
                @click="selectVariant(variant.name, item)"
              />
              <!-- Regular variant -->
              <button
                v-else
                class="variant-option"
                :class="{ selected: isSelected(variant.name, item) }"
                @click="selectVariant(variant.name, item)"
              >
                {{ getValue(item) }}
                <span v-if="getPriceModifier(item)" class="variant-price-mod">
                  {{ getPriceModifier(item) > 0 ? '+' : '' }}{{ getPriceModifier(item) }}
                </span>
              </button>
            </template>
          </div>
        </div>
      </div>
      
      <button class="btn btn-primary btn-add-to-cart" @click="handleAddToCart">
        <i class="fas fa-cart-plus"></i>
        <span>{{ t('shop.addToCart') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product, VariantValue, SelectedVariants, ProductImage, Variant } from '@/types'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'

// Normalized variant entry for display
interface NormalizedVariant {
  name: string
  isColor: boolean
  values: VariantValue[]
}

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()
const toast = useToast()
const { t } = useI18n()

const currentImageIndex = ref(0)
const selectedVariants = ref<SelectedVariants>({})
const showLightbox = ref(false)

// Lightbox functions
function openLightbox() {
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  showLightbox.value = false
  document.body.style.overflow = ''
}

function prevImage() {
  const images = props.product.images
  if (!images?.length) return
  currentImageIndex.value = currentImageIndex.value > 0 
    ? currentImageIndex.value - 1 
    : images.length - 1
}

function nextImage() {
  const images = props.product.images
  if (!images?.length) return
  currentImageIndex.value = currentImageIndex.value < images.length - 1 
    ? currentImageIndex.value + 1 
    : 0
}

// Type guard to check if variants are in array format (Variant[])
function isVariantArray(variants: Variant[] | Record<string, VariantValue[]>): variants is Variant[] {
  return Array.isArray(variants) && variants.length > 0 && 'name' in variants[0]
}

// Normalize variants to a consistent format for display
function normalizeVariants(variants: Variant[] | Record<string, VariantValue[]>): NormalizedVariant[] {
  if (!variants) return []
  
  // Handle array format: Variant[]
  if (isVariantArray(variants)) {
    return variants.map(v => ({
      name: v.name,
      isColor: v.isColor || false,
      values: v.values || []
    }))
  }
  
  // Handle object format: { variantName: VariantValue[] }
  return Object.entries(variants).map(([name, values]) => ({
    name,
    isColor: name.toLowerCase() === 'color' || name.toLowerCase() === 'boja',
    values: values || []
  }))
}

// Initialize with first variant of each type
function initializeVariants() {
  const normalized = normalizeVariants(props.product.variants)
  normalized.forEach(variant => {
    if (variant.values.length > 0) {
      const firstValue = variant.values[0]
      selectedVariants.value[variant.name] = {
        value: getValue(firstValue),
        priceModifier: getPriceModifier(firstValue),
        colorHex: getColorHex(firstValue)
      }
    }
  })
}

initializeVariants()

const hasVariants = computed(() => {
  const variants = props.product.variants
  if (!variants) return false
  if (Array.isArray(variants)) return variants.length > 0
  return Object.keys(variants).length > 0
})

// Get normalized variant entries for display
const variantEntries = computed((): NormalizedVariant[] => {
  if (!props.product.variants) return []
  return normalizeVariants(props.product.variants)
})

// Type guard for ProductImage
function isProductImage(img: string | ProductImage): img is ProductImage {
  return typeof img === 'object' && 'url' in img
}

// Helper to get image URL from string or ProductImage
function getImageUrl(img: string | { url: string }): string {
  return typeof img === 'string' ? img : img.url
}

// Helper to get image position for cropping
function getImagePosition(img: string | ProductImage | { positionX?: number; positionY?: number }): string {
  if (typeof img === 'string') return '50% 50%'
  const x = 'positionX' in img ? (img.positionX ?? 50) : 50
  const y = 'positionY' in img ? (img.positionY ?? 50) : 50
  return `${x}% ${y}%`
}

const currentImage = computed(() => {
  const images = props.product.images
  if (images?.length > 0) {
    return getImageUrl(images[currentImageIndex.value]) || getImageUrl(images[0])
  }
  return props.product.image || 'https://via.placeholder.com/300x300?text=No+Image'
})

const currentImagePosition = computed(() => {
  const images = props.product.images
  if (images?.length > 0) {
    return getImagePosition(images[currentImageIndex.value])
  }
  return '50% 50%'
})

const displayPrice = computed(() => {
  let total = props.product.price
  Object.values(selectedVariants.value).forEach(variant => {
    if (variant?.priceModifier) {
      total += variant.priceModifier
    }
  })
  return total
})

// Helper functions for variant values (handles both old string and new object format)
function getValue(item: VariantValue | string): string {
  return typeof item === 'string' ? item : item.value
}

function getColorHex(item: VariantValue | string): string {
  return typeof item === 'object' ? (item.colorHex || '') : ''
}

function getPriceModifier(item: VariantValue | string): number {
  return typeof item === 'object' ? (item.priceModifier || 0) : 0
}

function getVariantTitle(item: VariantValue | string): string {
  const value = getValue(item)
  const modifier = getPriceModifier(item)
  return modifier ? `${value} (${modifier > 0 ? '+' : ''}${modifier} RSD)` : value
}

function isSelected(variantName: string, item: VariantValue | string): boolean {
  return selectedVariants.value[variantName]?.value === getValue(item)
}

function selectVariant(variantName: string, item: VariantValue | string): void {
  selectedVariants.value[variantName] = {
    value: getValue(item),
    priceModifier: getPriceModifier(item),
    colorHex: getColorHex(item)
  }
  
  // Switch to linked image if available (only for ProductImage format)
  const value = getValue(item)
  const images = props.product.images
  if (images && images.length > 0) {
    const linkedImageIndex = images.findIndex((img) => {
      if (!isProductImage(img)) return false
      return img.linkedVariants?.some((lv) => lv.type === variantName && lv.value === value)
    })
    if (linkedImageIndex > -1) {
      currentImageIndex.value = linkedImageIndex
    }
  }
}

function handleAddToCart(): void {
  cartStore.addItem(props.product, selectedVariants.value)
  toast.show(t('shop.addedToCart'), 'success')
}
</script>

<style lang="scss" scoped>
.product-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    background: var(--card-bg-hover);
    
    .product-image {
      transform: scale(1.05);
    }
  }
}

.product-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.zoom-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--primary-color);
    transform: scale(1.1);
  }
}

.product-card:hover .zoom-btn {
  opacity: 1;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-thumbnails {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  border-radius: 8px;
}

.product-thumbnail {
  width: 40px;
  height: 40px;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  opacity: 0.6;
  transition: all 0.2s ease;
  background: transparent;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    opacity: 0.9;
  }
  
  &.active {
    opacity: 1;
    border-color: var(--primary-color);
    box-shadow: 0 0 10px rgba(78, 141, 245, 0.4);
  }
}

.product-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  line-height: 1.3;
}

.product-price {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.product-variants {
  margin-bottom: 1rem;
}

.variant-group {
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.variant-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--muted-color);
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-option {
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-color);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  
  &:hover {
    border-color: var(--primary-color);
    background: rgba(78, 141, 245, 0.1);
  }
  
  &.selected {
    border-color: var(--primary-color);
    background: rgba(78, 141, 245, 0.2);
    color: var(--primary-color);
  }
  
  &.color-option {
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 50%;
    border-width: 2px;
    
    &.selected {
      box-shadow: 0 0 0 3px var(--bg-color), 0 0 0 5px var(--primary-color);
    }
  }
}

.variant-price-mod {
  font-size: 0.7rem;
  color: var(--accent-color);
  font-weight: 500;
}

.btn-add-to-cart {
  width: 100%;
  margin-top: auto;
  padding: 0.85rem 1.25rem;
  
  i {
    font-size: 1rem;
  }
  
  span {
    font-weight: 600;
  }
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.lightbox-image {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--primary-color);
    transform: translateY(-50%) scale(1.1);
  }
  
  &.prev {
    left: -70px;
  }
  
  &.next {
    right: -70px;
  }
}

.lightbox-thumbnails {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.lightbox-thumb {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  opacity: 0.5;
  transition: all 0.2s ease;
  background: transparent;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    opacity: 0.8;
  }
  
  &.active {
    opacity: 1;
    border-color: var(--primary-color);
  }
}

@media (max-width: 768px) {
  .lightbox-nav {
    width: 40px;
    height: 40px;
    
    &.prev {
      left: 10px;
    }
    
    &.next {
      right: 10px;
    }
  }
  
  .lightbox-close {
    top: 10px;
    right: 10px;
  }
  
  .lightbox-thumb {
    width: 50px;
    height: 50px;
  }
}
</style>
