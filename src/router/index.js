import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Public pages
import HomePage from '@/views/HomePage.vue'
import ShopPage from '@/views/ShopPage.vue'
import CartPage from '@/views/CartPage.vue'
import CheckoutPage from '@/views/CheckoutPage.vue'

// Admin pages
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminProducts from '@/views/admin/AdminProducts.vue'
import AdminOrders from '@/views/admin/AdminOrders.vue'

const routes = [
  // Public routes
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopPage
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartPage
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutPage
  },
  
  // Admin routes
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'products',
        name: 'admin-products',
        component: AdminProducts
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: AdminOrders
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for admin routes
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    
    // Wait for auth to initialize
    if (!authStore.initialized) {
      await authStore.init()
    }
    
    if (!authStore.user) {
      next({ name: 'admin-login' })
      return
    }
  }
  next()
})

export default router
