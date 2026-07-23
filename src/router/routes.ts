import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginPage.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      // 公开页面
      { path: '', name: 'Home', component: () => import('@/views/home/HomePage.vue') },
      { path: 'products', name: 'ProductList', component: () => import('@/views/product/ProductListPage.vue') },
      { path: 'products/:id', name: 'ProductDetail', component: () => import('@/views/product/ProductDetailPage.vue') },

      // 需要登录
      { path: 'profile', name: 'Profile', component: () => import('@/views/profile/ProfilePage.vue'), meta: { requiresAuth: true } },
      { path: 'cart', name: 'Cart', component: () => import('@/views/cart/CartPage.vue'), meta: { requiresAuth: true } },
      { path: 'orders/create', name: 'OrderCreate', component: () => import('@/views/order/OrderCreatePage.vue'), meta: { requiresAuth: true } },
      { path: 'orders', name: 'OrderList', component: () => import('@/views/order/OrderListPage.vue'), meta: { requiresAuth: true } },
      { path: 'payment/:orderId', name: 'Payment', component: () => import('@/views/payment/PaymentPage.vue'), meta: { requiresAuth: true } },
      { path: 'my/reviews', name: 'MyReviews', component: () => import('@/views/review/MyReviewsPage.vue'), meta: { requiresAuth: true } },

      // 需要卖家或管理员
      { path: 'products/new', name: 'ProductCreate', component: () => import('@/views/product/ProductFormPage.vue'), meta: { requiresAuth: true, requiresSeller: true } },
      { path: 'products/:id/edit', name: 'ProductEdit', component: () => import('@/views/product/ProductFormPage.vue'), meta: { requiresAuth: true, requiresSeller: true }, props: true },

      // 需要管理员
      { path: 'inventory', name: 'Inventory', component: () => import('@/views/inventory/InventoryPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
      { path: 'inventory/movements/:id', name: 'InventoryMovements', component: () => import('@/views/inventory/InventoryMovementsPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
      { path: 'accounts', name: 'AccountList', component: () => import('@/views/account/AccountListPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
      { path: 'accounts/:id', name: 'AccountDetail', component: () => import('@/views/account/AccountDetailPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
  },
]

export default routes
