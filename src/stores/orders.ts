import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  orderBy, 
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { sendCustomerEmail, sendAdminEmail } from '@/utils/email'
import type { Order, Customer, CartItem } from '@/types'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const ordersCollection = collection(db, 'orders')

  async function fetchOrders(status?: string): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      let q = query(ordersCollection, orderBy('createdAt', 'desc'))
      
      if (status) {
        q = query(ordersCollection, where('status', '==', status), orderBy('createdAt', 'desc'))
      }
      
      const snapshot = await getDocs(q)
      orders.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching orders:', err)
    } finally {
      loading.value = false
    }
  }

  async function getOrder(id: string): Promise<Order | null> {
    try {
      const docRef = doc(ordersCollection, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order
      }
      return null
    } catch (err) {
      console.error('Error getting order:', err)
      return null
    }
  }

  async function createOrder(customer: Customer, items: CartItem[], total: number, shipping: number = 0): Promise<{ id: string; orderNumber: string }> {
    const orderNumber = `ORD-${Date.now()}`
    
    const orderItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variants: item.variants
    }))
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const docRef = await addDoc(ordersCollection, {
      orderNumber,
      customer,
      items: orderItems,
      subtotal,
      shipping,
      total,
      status: 'pending',
      createdAt: serverTimestamp()
    })

    // Send email notifications (don't await - fire and forget)
    const emailData = {
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerCity: customer.city,
      customerZip: customer.zip,
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        variants: item.variants ? Object.entries(item.variants).map(([k, v]) => `${k}: ${v.value}`).join(', ') : undefined
      })),
      total,
      shipping,
      tax: 0,
      notes: customer.notes
    }

    // Send emails in background
    sendCustomerEmail(emailData).catch(err => console.error('Failed to send customer email:', err))
    sendAdminEmail(emailData).catch(err => console.error('Failed to send admin email:', err))
    
    return { id: docRef.id, orderNumber }
  }

  async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    const docRef = doc(ordersCollection, id)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    })
    
    // Update local state
    const index = orders.value.findIndex(o => o.id === id)
    if (index > -1) {
      orders.value[index].status = status
    }
  }

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrderStatus
  }
})
