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
      { path: '', name: 'Home', component: () => import('@/views/home/HomePage.vue') },
      { path: 'products', name: 'ProductList', component: () => import('@/views/product/ProductListPage.vue') },
      { path: 'products/:id', name: 'ProductDetail', component: () => import('@/views/product/ProductDetailPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'products/new', name: 'ProductCreate', component: () => import('@/views/product/ProductFormPage.vue') },
      { path: 'products/:id/edit', name: 'ProductEdit', component: () => import('@/views/product/ProductFormPage.vue'), props: true },
      { path: 'orders/create', name: 'OrderCreate', component: () => import('@/views/order/OrderCreatePage.vue') },
      { path: 'orders', name: 'OrderList', component: () => import('@/views/order/OrderListPage.vue') },
      { path: 'payment/:orderId', name: 'Payment', component: () => import('@/views/payment/PaymentPage.vue') },
      { path: 'my/reviews', name: 'MyReviews', component: () => import('@/views/review/MyReviewsPage.vue') },
      { path: 'inventory', name: 'Inventory', component: () => import('@/views/inventory/InventoryPage.vue') },
      { path: 'inventory/movements/:id', name: 'InventoryMovements', component: () => import('@/views/inventory/InventoryMovementsPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: 'accounts', name: 'AccountList', component: () => import('@/views/account/AccountListPage.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
  },
]

export default routes
