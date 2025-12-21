import emailjs from '@emailjs/browser'

// EmailJS configuration from environment variables
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  customerTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  adminTemplateId: import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL || '3dgadgetslab@gmail.com'
}

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey)

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
  variants?: string
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerZip: string
  items: OrderItem[]
  total: number
  shipping?: number
  tax?: number
  notes?: string
}

/**
 * Send order confirmation email to customer
 * Template variables: order_id, orders (array with image_url, name, units, price), 
 * cost.shipping, cost.tax, cost.total, email
 */
export async function sendCustomerEmail(data: OrderEmailData): Promise<boolean> {
  if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.customerTemplateId) {
    console.warn('EmailJS customer template not configured')
    return false
  }

  // Format orders array for template loop
  const orders = data.items.map(item => ({
    image_url: item.image || 'https://via.placeholder.com/64x64?text=Item',
    name: `${item.name}${item.variants ? ` (${item.variants})` : ''}`,
    units: item.quantity,
    price: item.price.toFixed(2)
  }))

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.customerTemplateId, {
      order_id: data.orderNumber,
      orders: orders,
      cost: {
        shipping: (data.shipping || 0).toFixed(2),
        tax: (data.tax || 0).toFixed(2),
        total: data.total.toFixed(2)
      },
      email: data.customerEmail,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_address: `${data.customerAddress}, ${data.customerCity} ${data.customerZip}`
    })
    return true
  } catch (error) {
    console.error('Failed to send customer email:', error)
    throw error
  }
}

/**
 * Send order notification email to admin
 */
export async function sendAdminEmail(data: OrderEmailData): Promise<boolean> {
  if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.adminTemplateId) {
    console.warn('EmailJS admin template not configured')
    return false
  }

  // Format orders array for template loop
  const orders = data.items.map(item => ({
    image_url: item.image || 'https://via.placeholder.com/64x64?text=Item',
    name: `${item.name}${item.variants ? ` (${item.variants})` : ''}`,
    units: item.quantity,
    price: item.price.toFixed(2)
  }))

  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.adminTemplateId, {
      order_id: data.orderNumber,
      orders: orders,
      cost: {
        shipping: (data.shipping || 0).toFixed(2),
        tax: (data.tax || 0).toFixed(2),
        total: data.total.toFixed(2)
      },
      email: EMAILJS_CONFIG.adminEmail,
      // Additional admin-specific fields
      order_date: new Date().toLocaleDateString('sr-RS'),
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      customer_address: `${data.customerAddress}, ${data.customerCity} ${data.customerZip}`,
      customer_notes: data.notes || 'Nema napomena'
    })
    return true
  } catch (error) {
    console.error('Failed to send admin email:', error)
    throw error
  }
}

/**
 * Send test emails for both templates
 */
export async function sendTestEmails(testEmail: string): Promise<{ customer: boolean; admin: boolean; errors: string[] }> {
  const errors: string[] = []
  let customerSuccess = false
  let adminSuccess = false

  const testData: OrderEmailData = {
    orderNumber: 'TEST-' + Date.now(),
    customerName: 'Test Korisnik',
    customerEmail: testEmail,
    customerPhone: '+381 60 123 4567',
    customerAddress: 'Testna ulica 123',
    customerCity: 'Beograd',
    customerZip: '11000',
    items: [
      { name: 'Test Proizvod 1', quantity: 2, price: 1500, image: 'https://via.placeholder.com/64x64?text=Test1', variants: 'Crna, L' },
      { name: 'Test Proizvod 2', quantity: 1, price: 2500, image: 'https://via.placeholder.com/64x64?text=Test2' }
    ],
    total: 5500,
    shipping: 0,
    tax: 0,
    notes: 'Ovo je test porudžbina'
  }

  // Test customer email
  try {
    await sendCustomerEmail(testData)
    customerSuccess = true
  } catch (error) {
    errors.push(`Customer template: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test admin email
  try {
    await sendAdminEmail(testData)
    adminSuccess = true
  } catch (error) {
    errors.push(`Admin template: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { customer: customerSuccess, admin: adminSuccess, errors }
}

/**
 * Check if EmailJS is properly configured
 */
export function isEmailConfigured(): { configured: boolean; missing: string[] } {
  const missing: string[] = []
  
  if (!EMAILJS_CONFIG.serviceId) missing.push('VITE_EMAILJS_SERVICE_ID')
  if (!EMAILJS_CONFIG.customerTemplateId) missing.push('VITE_EMAILJS_TEMPLATE_ID')
  if (!EMAILJS_CONFIG.adminTemplateId) missing.push('VITE_EMAILJS_ADMIN_TEMPLATE_ID')
  if (!EMAILJS_CONFIG.publicKey) missing.push('VITE_EMAILJS_PUBLIC_KEY')
  
  return {
    configured: missing.length === 0,
    missing
  }
}
