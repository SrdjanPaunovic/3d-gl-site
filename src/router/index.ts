import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('@/views/ShopPage.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartPage.vue')
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutPage.vue')
  },
  {
    path: '/order',
    name: 'order-tracking',
    component: () => import('@/views/OrderTrackingPage.vue')
  },
  
  // Admin routes
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLogin.vue')
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/AdminDashboard.vue')
      },
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('@/views/admin/AdminProducts.vue')
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/views/admin/AdminOrders.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for admin routes
router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
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
