import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, SelectedVariants, Product } from '@/types'

const STORAGE_KEY = '3dgadgets_cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // Initialize from localStorage
  function init(): void {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      items.value = JSON.parse(stored)
    }
  }

  // Save to localStorage
  function save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  }

  // Computed properties
  const count = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const total = computed(() => 
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // Calculate price modifier from selected variants
  function calculatePriceModifier(selectedVariants: SelectedVariants): number {
    let totalModifier = 0
    Object.values(selectedVariants).forEach(variant => {
      if (variant?.priceModifier) {
        totalModifier += variant.priceModifier
      }
    })
    return totalModifier
  }

  // Add item to cart
  function addItem(product: Product, selectedVariants: SelectedVariants, quantity: number = 1): void {
    // Create unique key based on product ID and variants
    const variantKey = Object.entries(selectedVariants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v.value}`)
      .join('|')
    const itemKey = `${product.id}-${variantKey}`

    // Calculate total price including variant modifiers
    const priceModifier = calculatePriceModifier(selectedVariants)
    const finalPrice = product.price + priceModifier

    // Check if item already exists
    const existingIndex = items.value.findIndex(item => item.itemKey === itemKey)

    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity
    } else {
      // Get main image URL
      let imageUrl = ''
      if (product.images?.length > 0) {
        const firstImage = product.images[0]
        if (typeof firstImage === 'string') {
          imageUrl = firstImage
        } else {
          const mainImage = product.images.find((img: any) => typeof img !== 'string' && img.isMain) || firstImage
          imageUrl = typeof mainImage === 'string' ? mainImage : mainImage.url
        }
      } else if (product.image) {
        imageUrl = product.image
      }

      items.value.push({
        itemKey,
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        price: finalPrice,
        priceModifier,
        image: imageUrl,
        variants: selectedVariants,
        quantity
      })
    }

    save()
  }

  // Update item quantity
  function updateQuantity(itemKey: string, quantity: number): void {
    const index = items.value.findIndex(item => item.itemKey === itemKey)
    
    if (index > -1) {
      if (quantity <= 0) {
        items.value.splice(index, 1)
      } else {
        items.value[index].quantity = quantity
      }
      save()
    }
  }

  // Remove item from cart
  function removeItem(itemKey: string): void {
    items.value = items.value.filter(item => item.itemKey !== itemKey)
    save()
  }

  // Clear entire cart
  function clearCart(): void {
    items.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // Format variants for display
  function formatVariants(variants: SelectedVariants): string {
    return Object.entries(variants)
      .map(([key, val]) => `${key}: ${val.value}`)
      .join(', ')
  }

  // Initialize on store creation
  init()

  return {
    items,
    count,
    total,
    isEmpty,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    formatVariants
  }
})
