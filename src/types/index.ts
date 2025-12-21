// Product Types
export interface VariantValue {
  value: string
  colorHex?: string
  priceModifier: number
}

export interface Variant {
  name: string
  isColor?: boolean
  values: VariantValue[]
}

export interface ProductVariants {
  [variantName: string]: VariantValue[]
}

export interface ProductImage {
  url: string
  isMain?: boolean
  positionX?: number
  positionY?: number
  linkedVariants?: Array<{ type: string; value: string }>
}

export interface Product {
  id: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  price: number
  stock?: number
  featured?: boolean
  image: string
  images: ProductImage[] | string[]
  variants: Variant[] | ProductVariants
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  variants: ProductVariants
  images: ProductImage[]
}

// Cart Types
export interface SelectedVariant {
  value: string
  priceModifier: number
  colorHex?: string
}

export interface SelectedVariants {
  [variantName: string]: SelectedVariant
}

export interface CartItem {
  itemKey: string
  productId: string
  name: string
  basePrice: number
  price: number
  priceModifier: number
  image: string
  variants: SelectedVariants
  quantity: number
}

// Order Types
export interface Customer {
  name: string
  email: string
  phone: string
  address: string
  city: string
  zip: string
  notes?: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variants: SelectedVariants
}

export interface Order {
  id: string
  orderNumber: string
  customer: Customer
  items: OrderItem[]
  subtotal?: number
  shipping?: number
  total: number
  status: 'pending' | 'approved' | 'completed' | 'cancelled'
  createdAt?: Date
  updatedAt?: Date
}

// Auth Types
export interface AdminUser {
  uid: string
  email: string
}
