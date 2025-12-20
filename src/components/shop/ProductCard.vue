<template>
  <div class="product-card">
    <div class="product-image-container">
      <img 
        :src="currentImage" 
        :alt="product.name" 
        class="product-image" 
        loading="lazy"
      >
      <div v-if="product.images?.length > 1" class="product-thumbnails">
        <button
          v-for="(img, index) in product.images"
          :key="index"
          class="product-thumbnail"
          :class="{ active: currentImageIndex === index }"
          @click="currentImageIndex = index"
        >
          <img :src="getImageUrl(img)" :alt="`Thumbnail ${index + 1}`" loading="lazy">
        </button>
      </div>
    </div>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price">{{ formatPrice(displayPrice) }}</div>
      
      <!-- Variants -->
      <div v-if="hasVariants" class="product-variants">
        <div 
          v-for="(values, variantName) in product.variants" 
          :key="variantName"
          class="variant-group"
        >
          <div class="variant-label">{{ variantName }}</div>
          <div class="variant-options">
            <template v-for="item in values" :key="getValue(item)">
              <!-- Color variant -->
              <button
                v-if="isColorVariant(variantName as string) && getColorHex(item)"
                class="variant-option color-option"
                :class="{ selected: isSelected(variantName as string, item) }"
                :style="{ backgroundColor: getColorHex(item) }"
                :title="getVariantTitle(item)"
                @click="selectVariant(variantName as string, item)"
              />
              <!-- Regular variant -->
              <button
                v-else
                class="variant-option"
                :class="{ selected: isSelected(variantName as string, item) }"
                @click="selectVariant(variantName as string, item)"
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
import type { Product, VariantValue, SelectedVariants } from '@/types'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()
const toast = useToast()
const { t } = useI18n()

const currentImageIndex = ref(0)
const selectedVariants = ref<SelectedVariants>({})

// Initialize with first variant of each type
function initializeVariants() {
  if (props.product.variants) {
    Object.entries(props.product.variants).forEach(([name, values]) => {
      if (values.length > 0) {
        const firstValue = values[0]
        selectedVariants.value[name] = {
          value: getValue(firstValue),
          priceModifier: getPriceModifier(firstValue),
          colorHex: getColorHex(firstValue)
        }
      }
    })
  }
}

initializeVariants()

const hasVariants = computed(() => 
  props.product.variants && Object.keys(props.product.variants).length > 0
)

// Helper to get image URL from string or ProductImage
function getImageUrl(img: string | { url: string }): string {
  return typeof img === 'string' ? img : img.url
}

const currentImage = computed(() => {
  const images = props.product.images
  if (images?.length > 0) {
    return getImageUrl(images[currentImageIndex.value]) || getImageUrl(images[0])
  }
  return props.product.image || 'https://via.placeholder.com/300x300?text=No+Image'
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

function isColorVariant(name: string): boolean {
  const lowerName = name.toLowerCase()
  return lowerName === 'color' || lowerName === 'boja'
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
    const linkedImageIndex = images.findIndex((img: any) => {
      if (typeof img === 'string') return false
      return img.linkedVariants?.some((lv: any) => lv.type === variantName && lv.value === value)
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
  aspect-ratio: 1;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
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
</style>
