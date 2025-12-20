import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  query,
  serverTimestamp
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase'
import type { Product, ProductFormData } from '@/types'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const productsCollection = collection(db, 'products')

  async function fetchProducts(): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const q = query(productsCollection, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      products.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  async function getProduct(id: string): Promise<Product | null> {
    try {
      const docRef = doc(productsCollection, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product
      }
      return null
    } catch (err) {
      console.error('Error getting product:', err)
      return null
    }
  }

  async function addProduct(data: ProductFormData): Promise<string> {
    const docRef = await addDoc(productsCollection, {
      ...data,
      image: data.images.length > 0 ? data.images[0].url : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    await fetchProducts()
    return docRef.id
  }

  async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
    const docRef = doc(productsCollection, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    await fetchProducts()
  }

  async function deleteProduct(id: string): Promise<void> {
    const docRef = doc(productsCollection, id)
    await deleteDoc(docRef)
    products.value = products.value.filter(p => p.id !== id)
  }

  async function uploadImage(file: File): Promise<string> {
    const path = `products/${Date.now()}_${file.name}`
    const imageRef = storageRef(storage, path)
    await uploadBytes(imageRef, file)
    return await getDownloadURL(imageRef)
  }
  
  // Alias for createProduct
  async function createProduct(data: Partial<Product>): Promise<string> {
    const docRef = await addDoc(productsCollection, {
      ...data,
      image: Array.isArray(data.images) && data.images.length > 0 
        ? (typeof data.images[0] === 'string' ? data.images[0] : data.images[0].url)
        : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    await fetchProducts()
    return docRef.id
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    addProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage
  }
})
