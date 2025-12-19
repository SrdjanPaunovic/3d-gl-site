// Shopping Cart Module
const Cart = {
  STORAGE_KEY: '3dgadgets_cart',

  // Get cart from localStorage
  getCart() {
    const cart = localStorage.getItem(this.STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  },

  // Save cart to localStorage
  saveCart(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.updateCartCount();
  },

  // Calculate total price modifier from selected variants
  calculatePriceModifier(selectedVariants) {
    let totalModifier = 0;
    if (selectedVariants) {
      Object.values(selectedVariants).forEach(variant => {
        if (variant && typeof variant === 'object' && variant.priceModifier) {
          totalModifier += parseFloat(variant.priceModifier) || 0;
        }
      });
    }
    return totalModifier;
  },

  // Add item to cart
  addItem(product, selectedVariants = {}, quantity = 1) {
    const cart = this.getCart();
    
    // Create unique key based on product ID and variants
    // Store just the value for key generation
    const variantKey = Object.entries(selectedVariants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${typeof v === 'object' ? v.value : v}`)
      .join('|');
    const itemKey = `${product.id}-${variantKey}`;

    // Calculate total price including variant modifiers
    const priceModifier = this.calculatePriceModifier(selectedVariants);
    const finalPrice = product.price + priceModifier;

    // Check if item already exists
    const existingIndex = cart.findIndex(item => item.itemKey === itemKey);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      // Normalize variants to include all data
      const normalizedVariants = {};
      Object.entries(selectedVariants).forEach(([key, val]) => {
        if (typeof val === 'object') {
          normalizedVariants[key] = val;
        } else {
          normalizedVariants[key] = { value: val, priceModifier: 0 };
        }
      });
      
      cart.push({
        itemKey,
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        price: finalPrice,
        priceModifier,
        image: product.image || product.images?.[0]?.url || product.images?.[0] || '',
        variants: normalizedVariants,
        quantity
      });
    }

    this.saveCart(cart);
    return true;
  },

  // Update item quantity
  updateQuantity(itemKey, quantity) {
    const cart = this.getCart();
    const index = cart.findIndex(item => item.itemKey === itemKey);
    
    if (index > -1) {
      if (quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
      }
      this.saveCart(cart);
    }
  },

  // Remove item from cart
  removeItem(itemKey) {
    const cart = this.getCart().filter(item => item.itemKey !== itemKey);
    this.saveCart(cart);
  },

  // Clear entire cart
  clearCart() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateCartCount();
  },

  // Get cart total
  getTotal() {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  // Get cart count
  getCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  // Update cart count in header
  updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const count = this.getCount();
    countElements.forEach(el => {
      el.textContent = count;
      el.setAttribute('data-count', count);
    });
  },

  // Format price
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('RSD', 'RSD ');
  },

  // Format variants for display
  formatVariants(variants) {
    return Object.entries(variants)
      .map(([key, val]) => {
        // Handle both old format (string) and new format (object)
        const value = typeof val === 'object' ? val.value : val;
        return `${key}: ${value}`;
      })
      .join(', ');
  }
};

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCartCount();
});

// Export for use in other files
window.Cart = Cart;
