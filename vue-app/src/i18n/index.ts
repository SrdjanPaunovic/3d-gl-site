import { ref, computed, type App } from 'vue'

type Translations = {
  [key: string]: string | Translations
}

const translations: Record<string, Translations> = {
  sr: {
    nav: {
      home: 'Početna',
      shop: 'Prodavnica',
      cart: 'Korpa'
    },
    shop: {
      title: 'Svi proizvodi',
      subtitle: 'Pregledajte našu kolekciju 3D štampanih gadžeta i dodataka',
      addToCart: 'Dodaj u korpu',
      noProducts: 'Nema dostupnih proizvoda',
      addedToCart: 'Proizvod dodat u korpu!'
    },
    cart: {
      title: 'Korpa',
      empty: 'Vaša korpa je prazna',
      emptyMessage: 'Izgleda da još niste dodali proizvode u korpu.',
      continueShopping: 'Nastavi kupovinu',
      checkout: 'Nastavi na plaćanje',
      total: 'Ukupno:',
      remove: 'Ukloni'
    },
    checkout: {
      title: 'Plaćanje',
      orderSummary: 'Pregled porudžbine',
      customerInfo: 'Podaci o kupcu',
      firstName: 'Ime',
      lastName: 'Prezime',
      email: 'Email adresa',
      phone: 'Broj telefona',
      address: 'Adresa',
      city: 'Grad',
      zipCode: 'Poštanski broj',
      notes: 'Napomena (opciono)',
      cashOnDelivery: 'Plaćanje pouzećem:',
      cashOnDeliveryDesc: 'Platićete gotovinom prilikom preuzimanja.',
      placeOrder: 'Poruči',
      orderSuccess: 'Porudžbina uspešna!',
      orderSuccessMessage: 'Hvala vam na porudžbini. Primili smo vaš zahtev i uskoro ćemo vas kontaktirati radi potvrde.'
    },
    footer: {
      rights: 'Sva prava zadržana.'
    },
    admin: {
      dashboard: 'Dashboard',
      products: 'Proizvodi',
      orders: 'Porudžbine',
      viewShop: 'Pogledaj prodavnicu',
      logout: 'Odjava',
      totalProducts: 'Ukupno proizvoda',
      totalOrders: 'Ukupno porudžbina',
      pendingOrders: 'Porudžbine na čekanju',
      completedOrders: 'Završene porudžbine',
      totalRevenue: 'Ukupan prihod',
      recentOrders: 'Skorašnje porudžbine',
      viewAll: 'Pogledaj sve',
      addProduct: 'Dodaj proizvod',
      editProduct: 'Izmeni proizvod',
      productName: 'Naziv proizvoda',
      price: 'Cena',
      description: 'Opis',
      variants: 'Varijante',
      images: 'Slike',
      save: 'Sačuvaj',
      cancel: 'Otkaži',
      delete: 'Obriši',
      approve: 'Odobri',
      complete: 'Završi',
      basicInfo: 'Osnovne informacije',
      searchProducts: 'Pretraži proizvode',
      searchOrders: 'Pretraži porudžbine',
      noProducts: 'Nema proizvoda',
      noOrders: 'Nema porudžbina',
      allStatuses: 'Svi statusi',
      orderId: 'ID Porudžbine',
      customer: 'Kupac',
      items: 'Stavke',
      total: 'Ukupno',
      status: 'Status',
      date: 'Datum',
      actions: 'Akcije',
      view: 'Pregled',
      orderDetails: 'Detalji porudžbine',
      orderInfo: 'Informacije o porudžbini',
      variantName: 'Naziv varijante',
      isColorVariant: 'Varijanta boje',
      value: 'Vrednost',
      addValue: 'Dodaj vrednost',
      addVariant: 'Dodaj varijantu',
      pickColor: 'Izaberi boju',
      dropImages: 'Prevucite slike ovde',
      orClickToSelect: 'ili kliknite za izbor',
      imagesUploaded: 'Slike uspešno otpremljene',
      uploadError: 'Greška pri otpremanju',
      productCreated: 'Proizvod uspešno kreiran',
      productUpdated: 'Proizvod uspešno ažuriran',
      productDeleted: 'Proizvod uspešno obrisan',
      saveError: 'Greška pri čuvanju',
      deleteError: 'Greška pri brisanju',
      confirmDelete: 'Potvrdi brisanje',
      deleteProductConfirm: 'Da li ste sigurni da želite da obrišete proizvod "{name}"?',
      uploading: 'Otpremanje',
      edit: 'Izmeni'
    },
    product: {
      name: 'Naziv',
      description: 'Opis',
      price: 'Cena',
      stock: 'Zaliha',
      featured: 'Istaknuti proizvod'
    },
    order: {
      pending: 'Na čekanju',
      processing: 'U obradi',
      completed: 'Završeno',
      cancelled: 'Otkazano'
    },
    customer: {
      name: 'Ime',
      email: 'Email',
      phone: 'Telefon',
      address: 'Adresa',
      notes: 'Napomene'
    },
    common: {
      cancel: 'Otkaži',
      save: 'Sačuvaj'
    }
  },
  en: {
    nav: {
      home: 'Home',
      shop: 'Shop',
      cart: 'Cart'
    },
    shop: {
      title: 'All Products',
      subtitle: 'Browse our collection of 3D printed gadgets and accessories',
      addToCart: 'Add to Cart',
      noProducts: 'No products available',
      addedToCart: 'Product added to cart!'
    },
    cart: {
      title: 'Cart',
      empty: 'Your cart is empty',
      emptyMessage: 'Looks like you haven\'t added any products yet.',
      continueShopping: 'Continue Shopping',
      checkout: 'Proceed to Checkout',
      total: 'Total:',
      remove: 'Remove'
    },
    checkout: {
      title: 'Checkout',
      orderSummary: 'Order Summary',
      customerInfo: 'Customer Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      city: 'City',
      zipCode: 'ZIP Code',
      notes: 'Notes (optional)',
      cashOnDelivery: 'Cash on Delivery:',
      cashOnDeliveryDesc: 'You will pay in cash upon delivery.',
      placeOrder: 'Place Order',
      orderSuccess: 'Order Successful!',
      orderSuccessMessage: 'Thank you for your order. We have received your request and will contact you shortly to confirm.'
    },
    footer: {
      rights: 'All rights reserved.'
    },
    admin: {
      dashboard: 'Dashboard',
      products: 'Products',
      orders: 'Orders',
      viewShop: 'View Shop',
      logout: 'Logout',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      pendingOrders: 'Pending Orders',
      completedOrders: 'Completed Orders',
      totalRevenue: 'Total Revenue',
      recentOrders: 'Recent Orders',
      viewAll: 'View All',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      productName: 'Product Name',
      price: 'Price',
      description: 'Description',
      variants: 'Variants',
      images: 'Images',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      approve: 'Approve',
      complete: 'Complete',
      basicInfo: 'Basic Info',
      searchProducts: 'Search products',
      searchOrders: 'Search orders',
      noProducts: 'No products',
      noOrders: 'No orders',
      allStatuses: 'All statuses',
      orderId: 'Order ID',
      customer: 'Customer',
      items: 'Items',
      total: 'Total',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      view: 'View',
      orderDetails: 'Order Details',
      orderInfo: 'Order Info',
      variantName: 'Variant name',
      isColorVariant: 'Color variant',
      value: 'Value',
      addValue: 'Add value',
      addVariant: 'Add variant',
      pickColor: 'Pick color',
      dropImages: 'Drop images here',
      orClickToSelect: 'or click to select',
      imagesUploaded: 'Images uploaded successfully',
      uploadError: 'Upload error',
      productCreated: 'Product created successfully',
      productUpdated: 'Product updated successfully',
      productDeleted: 'Product deleted successfully',
      saveError: 'Save error',
      deleteError: 'Delete error',
      confirmDelete: 'Confirm delete',
      deleteProductConfirm: 'Are you sure you want to delete "{name}"?',
      uploading: 'Uploading',
      edit: 'Edit'
    },
    product: {
      name: 'Name',
      description: 'Description',
      price: 'Price',
      stock: 'Stock',
      featured: 'Featured product'
    },
    order: {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },
    customer: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      notes: 'Notes'
    },
    common: {
      cancel: 'Cancel',
      save: 'Save'
    }
  }
}

const currentLang = ref<string>(localStorage.getItem('lang') || 'sr')

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.')
  let value: any = obj
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return path // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : path
}

export function useI18n() {
  const t = (key: string): string => {
    return getNestedValue(translations[currentLang.value] || translations.sr, key)
  }

  const setLanguage = (lang: string): void => {
    currentLang.value = lang
    localStorage.setItem('lang', lang)
  }

  const language = computed(() => currentLang.value)

  return { t, setLanguage, language }
}

// Vue plugin
export const i18n = {
  install(app: App) {
    app.config.globalProperties.$t = (key: string) => {
      return getNestedValue(translations[currentLang.value] || translations.sr, key)
    }
  }
}
