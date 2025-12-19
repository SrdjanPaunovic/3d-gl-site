<template>
  <div class="admin-products">
    <!-- Header -->
    <div class="products-header">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="t('admin.searchProducts')"
          class="form-control"
        >
      </div>
      <button class="btn btn-primary" @click="openProductModal()">
        <i class="fas fa-plus"></i>
        {{ t('admin.addProduct') }}
      </button>
    </div>

    <!-- Products Grid -->
    <div class="products-grid" v-if="filteredProducts.length">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="getFirstImageUrl(product)" :alt="product.name">
          <div class="product-actions">
            <button class="btn btn-icon" @click="openProductModal(product)" :title="t('admin.edit')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-icon btn-danger" @click="confirmDelete(product)" :title="t('admin.delete')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="product-price">{{ formatPrice(product.price) }}</p>
          <div class="product-meta">
            <span :class="['stock-badge', (product.stock ?? 0) > 0 ? 'in-stock' : 'out-of-stock']">
              {{ (product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of stock' }}
            </span>
            <span class="featured-badge" v-if="product.featured">
              <i class="fas fa-star"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>{{ t('admin.noProducts') }}</p>
      <button class="btn btn-primary" @click="openProductModal()">
        {{ t('admin.addProduct') }}
      </button>
    </div>

    <!-- Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal product-modal">
        <div class="modal-header">
          <h2>{{ editingProduct ? t('admin.editProduct') : t('admin.addProduct') }}</h2>
          <button class="btn btn-icon" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveProduct" class="modal-body">
          <div class="form-tabs">
            <button 
              type="button" 
              :class="['tab', { active: activeTab === 'basic' }]"
              @click="activeTab = 'basic'"
            >
              {{ t('admin.basicInfo') }}
            </button>
            <button 
              type="button" 
              :class="['tab', { active: activeTab === 'images' }]"
              @click="activeTab = 'images'"
            >
              {{ t('admin.images') }}
            </button>
            <button 
              type="button" 
              :class="['tab', { active: activeTab === 'variants' }]"
              @click="activeTab = 'variants'"
            >
              {{ t('admin.variants') }}
            </button>
          </div>

          <!-- Basic Info Tab -->
          <div v-show="activeTab === 'basic'" class="tab-content">
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('product.name') }} (SR)</label>
                <input v-model="form.name" type="text" class="form-control" required>
              </div>
              <div class="form-group">
                <label>{{ t('product.name') }} (EN)</label>
                <input v-model="form.nameEn" type="text" class="form-control">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('product.description') }} (SR)</label>
                <textarea v-model="form.description" class="form-control" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>{{ t('product.description') }} (EN)</label>
                <textarea v-model="form.descriptionEn" class="form-control" rows="3"></textarea>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('product.price') }} (RSD)</label>
                <input v-model.number="form.price" type="number" class="form-control" required min="0">
              </div>
              <div class="form-group">
                <label>{{ t('product.stock') }}</label>
                <input v-model.number="form.stock" type="number" class="form-control" min="0">
              </div>
            </div>
            
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="form.featured">
                {{ t('product.featured') }}
              </label>
            </div>
          </div>

          <!-- Images Tab -->
          <div v-show="activeTab === 'images'" class="tab-content">
            <div class="image-upload-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
              <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="handleFileSelect">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>{{ t('admin.dropImages') }}</p>
              <span>{{ t('admin.orClickToSelect') }}</span>
            </div>
            
            <div class="image-preview-grid" v-if="form.images.length">
              <div v-for="(image, index) in form.images" :key="index" class="image-preview">
                <img :src="image" alt="Product image">
                <button type="button" class="remove-image" @click="removeImage(index)">
                  <i class="fas fa-times"></i>
                </button>
                <span v-if="index === 0" class="main-badge">Main</span>
              </div>
            </div>
            
            <div v-if="uploadingImages" class="upload-progress">
              <div class="spinner"></div>
              <span>{{ t('admin.uploading') }}...</span>
            </div>
          </div>

          <!-- Variants Tab -->
          <div v-show="activeTab === 'variants'" class="tab-content">
            <div class="variants-list">
              <div v-for="(variant, vIndex) in form.variants" :key="vIndex" class="variant-block">
                <div class="variant-header">
                  <div class="form-group variant-name-group">
                    <input 
                      v-model="variant.name" 
                      type="text" 
                      class="form-control" 
                      :placeholder="t('admin.variantName')"
                    >
                    <div class="checkbox-inline">
                      <label>
                        <input type="checkbox" v-model="variant.isColor">
                        {{ t('admin.isColorVariant') }}
                      </label>
                    </div>
                  </div>
                  <button type="button" class="btn btn-icon btn-danger" @click="removeVariant(vIndex)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                
                <div class="variant-values">
                  <div v-for="(val, valIndex) in variant.values" :key="valIndex" class="variant-value-item">
                    <input 
                      v-model="val.value" 
                      type="text" 
                      class="form-control value-input" 
                      :placeholder="t('admin.value')"
                    >
                    
                    <div v-if="variant.isColor" class="color-picker-wrapper">
                      <input 
                        v-model="val.colorHex" 
                        type="color" 
                        class="color-input"
                        :title="t('admin.pickColor')"
                      >
                      <input 
                        v-model="val.colorHex" 
                        type="text" 
                        class="form-control hex-input" 
                        placeholder="#000000"
                        maxlength="7"
                      >
                    </div>
                    
                    <div class="price-modifier-wrapper">
                      <span class="modifier-label">+/-</span>
                      <input 
                        v-model.number="val.priceModifier" 
                        type="number" 
                        class="form-control modifier-input" 
                        placeholder="0"
                      >
                      <span class="modifier-currency">RSD</span>
                    </div>
                    
                    <button type="button" class="btn btn-icon btn-sm" @click="removeVariantValue(vIndex, valIndex)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <button type="button" class="btn btn-secondary btn-sm" @click="addVariantValue(vIndex)">
                    <i class="fas fa-plus"></i>
                    {{ t('admin.addValue') }}
                  </button>
                </div>
              </div>
            </div>
            
            <button type="button" class="btn btn-secondary" @click="addVariant">
              <i class="fas fa-plus"></i>
              {{ t('admin.addVariant') }}
            </button>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <template v-if="saving">
                <div class="spinner spinner-sm"></div>
              </template>
              <template v-else>
                {{ editingProduct ? t('common.save') : t('admin.addProduct') }}
              </template>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="productToDelete" class="modal-overlay" @click.self="productToDelete = null">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h2>{{ t('admin.confirmDelete') }}</h2>
        </div>
        <div class="modal-body">
          <p>{{ t('admin.confirmDelete') }}: {{ productToDelete.name }}?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="productToDelete = null">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-danger" @click="deleteProduct" :disabled="deleting">
            <template v-if="deleting">
              <div class="spinner spinner-sm"></div>
            </template>
            <template v-else>
              {{ t('admin.delete') }}
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useI18n } from '@/i18n'
import { formatPrice } from '@/utils/format'
import { useToast } from '@/composables/useToast'
import type { Product, VariantValue } from '@/types'

interface ProductForm {
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: number
  stock: number
  featured: boolean
  images: string[]
  variants: FormVariant[]
}

interface FormVariant {
  name: string
  isColor: boolean
  values: VariantValue[]
}

const productsStore = useProductsStore()
const { t } = useI18n()
const { showToast } = useToast()

const searchQuery = ref('')
const showModal = ref(false)
const activeTab = ref<'basic' | 'images' | 'variants'>('basic')
const editingProduct = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)
const saving = ref(false)
const deleting = ref(false)
const uploadingImages = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const defaultForm = (): ProductForm => ({
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  price: 0,
  stock: 10,
  featured: false,
  images: [],
  variants: []
})

const form = reactive<ProductForm>(defaultForm())

onMounted(async () => {
  await productsStore.fetchProducts()
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return productsStore.products
  const query = searchQuery.value.toLowerCase()
  return productsStore.products.filter((p: any) => 
    p.name.toLowerCase().includes(query) ||
    (p.nameEn && p.nameEn.toLowerCase().includes(query))
  )
})

function getFirstImageUrl(product: Product): string {
  if (!product.images || product.images.length === 0) {
    return product.image || '/placeholder.jpg'
  }
  const firstImage = product.images[0]
  return typeof firstImage === 'string' ? firstImage : firstImage.url
}

function getProductImages(product: Product): string[] {
  if (!product.images) return []
  if (Array.isArray(product.images)) {
    return product.images.map(img => typeof img === 'string' ? img : img.url)
  }
  return []
}

function getProductVariants(product: Product): FormVariant[] {
  if (!product.variants) return []
  
  // Handle array format
  if (Array.isArray(product.variants)) {
    return product.variants.map((v: any) => ({
      name: v.name || '',
      isColor: v.isColor || false,
      values: (v.values || []).map((val: any) => {
        if (typeof val === 'string') {
          return { value: val, colorHex: '', priceModifier: 0 }
        }
        return { 
          value: val.value || '', 
          colorHex: val.colorHex || '', 
          priceModifier: val.priceModifier || 0 
        }
      })
    }))
  }
  
  // Handle object format { variantName: values[] }
  return Object.entries(product.variants).map(([name, values]) => ({
    name,
    isColor: name.toLowerCase().includes('color') || name.toLowerCase().includes('boja'),
    values: (values as any[]).map((val: any) => {
      if (typeof val === 'string') {
        return { value: val, colorHex: '', priceModifier: 0 }
      }
      return { 
        value: val.value || '', 
        colorHex: val.colorHex || '', 
        priceModifier: val.priceModifier || 0 
      }
    })
  }))
}

function openProductModal(product?: Product) {
  if (product) {
    editingProduct.value = product
    Object.assign(form, {
      name: product.name,
      nameEn: (product as any).nameEn || '',
      description: product.description || '',
      descriptionEn: (product as any).descriptionEn || '',
      price: product.price,
      stock: (product as any).stock || 0,
      featured: (product as any).featured || false,
      images: getProductImages(product),
      variants: getProductVariants(product)
    })
  } else {
    editingProduct.value = null
    Object.assign(form, defaultForm())
  }
  activeTab.value = 'basic'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    await uploadFiles(Array.from(target.files))
  }
}

async function handleDrop(event: DragEvent) {
  if (event.dataTransfer?.files) {
    await uploadFiles(Array.from(event.dataTransfer.files))
  }
}

async function uploadFiles(files: File[]) {
  uploadingImages.value = true
  try {
    for (const file of files) {
      const url = await productsStore.uploadImage(file)
      form.images.push(url)
    }
    showToast(t('admin.imagesUploaded'), 'success')
  } catch (error) {
    showToast(t('admin.uploadError'), 'error')
  } finally {
    uploadingImages.value = false
  }
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

function addVariant() {
  form.variants.push({
    name: '',
    isColor: false,
    values: [{ value: '', colorHex: '', priceModifier: 0 }]
  })
}

function removeVariant(index: number) {
  form.variants.splice(index, 1)
}

function addVariantValue(variantIndex: number) {
  form.variants[variantIndex].values.push({ value: '', colorHex: '', priceModifier: 0 })
}

function removeVariantValue(variantIndex: number, valueIndex: number) {
  form.variants[variantIndex].values.splice(valueIndex, 1)
}

async function saveProduct() {
  saving.value = true
  
  try {
    const productData: any = {
      name: form.name,
      nameEn: form.nameEn,
      description: form.description,
      descriptionEn: form.descriptionEn,
      price: form.price,
      stock: form.stock,
      featured: form.featured,
      image: form.images.length > 0 ? form.images[0] : '',
      images: form.images,
      variants: form.variants.filter(v => v.name && v.values.length).map(v => ({
        name: v.name,
        isColor: v.isColor,
        values: v.values.filter(val => val.value).map(val => ({
          value: val.value,
          colorHex: v.isColor ? val.colorHex : undefined,
          priceModifier: val.priceModifier || 0
        }))
      }))
    }
    
    if (editingProduct.value) {
      await productsStore.updateProduct(editingProduct.value.id, productData)
      showToast(t('admin.productUpdated'), 'success')
    } else {
      await productsStore.createProduct(productData)
      showToast(t('admin.productCreated'), 'success')
    }
    
    closeModal()
  } catch (error) {
    showToast(t('admin.saveError'), 'error')
  } finally {
    saving.value = false
  }
}

function confirmDelete(product: Product) {
  productToDelete.value = product
}

async function deleteProduct() {
  if (!productToDelete.value) return
  
  deleting.value = true
  try {
    await productsStore.deleteProduct(productToDelete.value.id)
    showToast(t('admin.productDeleted'), 'success')
    productToDelete.value = null
  } catch (error) {
    showToast(t('admin.deleteError'), 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped lang="scss">
.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
  
  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted-color);
  }
  
  input {
    padding-left: 2.5rem;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    
    .product-actions {
      opacity: 1;
    }
  }
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity var(--transition-speed);
}

.product-info {
  padding: 1rem;
  
  h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.product-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
}

.stock-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &.in-stock {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }
  
  &.out-of-stock {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }
}

.featured-badge {
  color: #fbbf24;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.product-modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.form-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem;
  
  .tab {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    color: var(--muted-color);
    cursor: pointer;
    position: relative;
    transition: color var(--transition-speed);
    
    &:hover {
      color: var(--text-color);
    }
    
    &.active {
      color: var(--primary-color);
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--primary-color);
      }
    }
  }
}

.tab-content {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.checkbox-group {
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
}

/* Image Upload */
.image-upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-speed), background var(--transition-speed);
  
  &:hover {
    border-color: var(--primary-color);
    background: rgba(99, 102, 241, 0.05);
  }
  
  i {
    font-size: 3rem;
    color: var(--muted-color);
    margin-bottom: 1rem;
  }
  
  p {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  span {
    font-size: 0.875rem;
    color: var(--muted-color);
  }
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    background: rgba(239, 68, 68, 0.9);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }
  
  .main-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    background: var(--primary-color);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
  }
}

.upload-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: var(--muted-color);
}

/* Variants */
.variants-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.variant-block {
  background: var(--bg-darker);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
}

.variant-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.variant-name-group {
  flex: 1;
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0;
  
  input {
    flex: 1;
  }
}

.checkbox-inline {
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--muted-color);
    white-space: nowrap;
  }
}

.variant-values {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.variant-value-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.value-input {
  flex: 1;
  min-width: 120px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 40px;
  height: 40px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }
  
  &::-webkit-color-swatch {
    border-radius: 4px;
    border: none;
  }
}

.hex-input {
  width: 90px;
  font-family: monospace;
  font-size: 0.875rem;
}

.price-modifier-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0 0.5rem;
}

.modifier-label,
.modifier-currency {
  font-size: 0.75rem;
  color: var(--muted-color);
}

.modifier-input {
  width: 80px;
  border: none;
  background: transparent;
  text-align: center;
  padding: 0.5rem 0;
}

/* Confirm Modal */
.confirm-modal {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  
  .modal-body {
    padding: 1.5rem;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  
  i {
    font-size: 4rem;
    color: var(--muted-color);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--muted-color);
    margin-bottom: 1.5rem;
  }
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-speed);
  
  &:hover {
    background: var(--card-bg-hover);
  }
  
  &.btn-danger {
    background: rgba(239, 68, 68, 0.1);
    border-color: transparent;
    color: #f87171;
    
    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
  }
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}
</style>
