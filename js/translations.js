// Translations / Prevodi
const translations = {
  sr: {
    // Navigation
    nav: {
      home: 'Početna',
      shop: 'Prodavnica',
      cart: 'Korpa',
      about: 'O nama',
      contact: 'Kontakt'
    },
    // Shop page
    shop: {
      title: 'Prodavnica',
      allProducts: 'Svi proizvodi',
      loading: 'Učitavanje proizvoda...',
      noProducts: 'Nema dostupnih proizvoda.',
      addToCart: 'Dodaj u korpu',
      outOfStock: 'Nema na stanju',
      selectVariant: 'Izaberite',
      price: 'Cena',
      search: 'Pretraži proizvode...',
      filters: 'Filteri',
      sortBy: 'Sortiraj po',
      sortNewest: 'Najnovije',
      sortPriceLow: 'Cena: niska ka visokoj',
      sortPriceHigh: 'Cena: visoka ka niskoj',
      sortName: 'Ime A-Z'
    },
    // Cart page
    cart: {
      title: 'Korpa',
      empty: 'Vaša korpa je prazna',
      emptyMessage: 'Izgleda da još niste dodali proizvode u korpu.',
      continueShopping: 'Nastavi kupovinu',
      product: 'Proizvod',
      price: 'Cena',
      quantity: 'Količina',
      total: 'Ukupno',
      remove: 'Ukloni',
      subtotal: 'Međuzbir',
      shipping: 'Dostava',
      freeShipping: 'Besplatna',
      orderTotal: 'Ukupno za plaćanje',
      checkout: 'Nastavi na plaćanje',
      itemsInCart: 'artikala u korpi'
    },
    // Checkout page
    checkout: {
      title: 'Plaćanje',
      customerInfo: 'Podaci o kupcu',
      firstName: 'Ime',
      lastName: 'Prezime',
      email: 'Email adresa',
      phone: 'Broj telefona',
      shippingAddress: 'Adresa za dostavu',
      address: 'Adresa',
      city: 'Grad',
      zipCode: 'Poštanski broj',
      notes: 'Napomena (opciono)',
      notesPlaceholder: 'Posebne instrukcije za dostavu...',
      orderSummary: 'Pregled porudžbine',
      paymentMethod: 'Način plaćanja',
      cashOnDelivery: 'Plaćanje pouzećem',
      cashOnDeliveryDesc: 'Platite gotovinom prilikom preuzimanja',
      placeOrder: 'Poruči',
      processing: 'Obrada...',
      orderSuccess: 'Porudžbina uspešna!',
      orderSuccessMessage: 'Hvala vam na porudžbini! Poslaćemo vam email sa potvrdom.',
      orderNumber: 'Broj porudžbine',
      backToShop: 'Nazad u prodavnicu',
      required: 'Obavezno polje'
    },
    // General
    general: {
      currency: 'RSD',
      language: 'Jezik',
      serbian: 'Srpski',
      english: 'English'
    },
    // Footer
    footer: {
      rights: 'Sva prava zadržana',
      privacy: 'Politika privatnosti',
      terms: 'Uslovi korišćenja'
    }
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      shop: 'Shop',
      cart: 'Cart',
      about: 'About',
      contact: 'Contact'
    },
    // Shop page
    shop: {
      title: 'Shop',
      allProducts: 'All Products',
      loading: 'Loading products...',
      noProducts: 'No products available.',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      selectVariant: 'Select',
      price: 'Price',
      search: 'Search products...',
      filters: 'Filters',
      sortBy: 'Sort by',
      sortNewest: 'Newest',
      sortPriceLow: 'Price: Low to High',
      sortPriceHigh: 'Price: High to Low',
      sortName: 'Name A-Z'
    },
    // Cart page
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyMessage: 'Looks like you haven\'t added any items to your cart yet.',
      continueShopping: 'Continue Shopping',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      remove: 'Remove',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      freeShipping: 'Free',
      orderTotal: 'Order Total',
      checkout: 'Proceed to Checkout',
      itemsInCart: 'items in cart'
    },
    // Checkout page
    checkout: {
      title: 'Checkout',
      customerInfo: 'Customer Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      shippingAddress: 'Shipping Address',
      address: 'Address',
      city: 'City',
      zipCode: 'ZIP Code',
      notes: 'Notes (optional)',
      notesPlaceholder: 'Special delivery instructions...',
      orderSummary: 'Order Summary',
      paymentMethod: 'Payment Method',
      cashOnDelivery: 'Cash on Delivery',
      cashOnDeliveryDesc: 'Pay with cash upon delivery',
      placeOrder: 'Place Order',
      processing: 'Processing...',
      orderSuccess: 'Order Successful!',
      orderSuccessMessage: 'Thank you for your order! We\'ll send you a confirmation email.',
      orderNumber: 'Order Number',
      backToShop: 'Back to Shop',
      required: 'Required field'
    },
    // General
    general: {
      currency: 'RSD',
      language: 'Language',
      serbian: 'Srpski',
      english: 'English'
    },
    // Footer
    footer: {
      rights: 'All rights reserved',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service'
    }
  }
};

// Language service
const Lang = {
  currentLang: localStorage.getItem('lang') || 'sr', // Serbian default

  init() {
    this.currentLang = localStorage.getItem('lang') || 'sr';
    this.updatePageLanguage();
    this.updateLangSwitcher();
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.updatePageLanguage();
    this.updateLangSwitcher();
  },

  get(key) {
    const keys = key.split('.');
    let value = translations[this.currentLang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  },

  updatePageLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.get(key);
      if (translation) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Update elements with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.get(key);
      if (translation) {
        el.placeholder = translation;
      }
    });

    // Update document language
    document.documentElement.lang = this.currentLang;
  },

  updateLangSwitcher() {
    const switcher = document.getElementById('lang-switcher');
    if (switcher) {
      switcher.value = this.currentLang;
    }
    
    // Update flag icons if present
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === this.currentLang);
    });
  }
};

// Export
window.translations = translations;
window.Lang = Lang;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Lang.init();
});
