# Go Shop 电商前端设计方案

> 基于 `api-docs.md` 接口文档，基于 Vue 3 生态的前端架构设计方案。
> 目标：高复用、可维护、类型安全、权限规范。

---

## 目录

- [1. 技术栈](#1-技术栈)
- [2. 项目目录结构](#2-项目目录结构)
- [3. 路由设计](#3-路由设计)
- [4. 组件架构](#4-组件架构)
- [5. API 层设计](#5-api-层设计)
- [6. 状态管理（Pinia）](#6-状态管理pinia)
- [7. 认证与授权流程](#7-认证与授权流程)
- [8. 通用类型定义](#8-通用类型定义)
- [9. 页面详细设计](#9-页面详细设计)
- [10. 错误处理与反馈](#10-错误处理与反馈)
- [11. 性能优化建议](#11-性能优化建议)
- [12. 开发规范](#12-开发规范)

---

## 1. 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| 框架 | **Vue 3.5+** | Composition API + `<script setup lang="ts">` |
| 构建工具 | **Vite 6** | 快速 HMR、ESBuild 编译 |
| 语言 | **TypeScript** | 严格模式，全量类型覆盖 |
| 路由 | **Vue Router 4** | Hash 模式（适配静态部署） |
| 状态管理 | **Pinia** | 模块化 Store，Composition API 风格 |
| HTTP 客户端 | **Axios** | 请求/响应拦截器、Token 注入、统一错误处理 |
| UI 组件库 | **Element Plus** | 成熟的中文生态，表格/表单/分页/弹窗开箱即用 |
| CSS 方案 | **SCSS + Element Plus 主题变量** | 统一的 Design Token |
| 代码规范 | **ESLint + Prettier** | 配合 Husky 提交前检查 |

**选型理由：**

- **Element Plus** 是 Vue 3 生态最成熟的 UI 库，特别适合后台/管理类页面（订单表格、库存表单、分页列表等），且对中文场景友好。
- **Pinia** 相比 Vuex 有更好的 TypeScript 推断，且去掉了 mutations，与 Composition API 一脉相承。
- **SCSS** 提供变量、mixin、嵌套等能力，配合 Element Plus 的 CSS 变量实现主题定制。

---

## 2. 项目目录结构

```
go-shop-fe/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env                        # 环境变量（API Base URL 等）
├── .env.development
├── .env.production
│
├── public/
│   └── favicon.ico
│
└── src/
    ├── main.ts                 # 应用入口
    ├── App.vue                 # 根组件
    │
    ├── types/                  # # TypeScript 类型定义
    │   ├── api.ts              # API 请求/响应类型
    │   ├── models.ts           # 业务模型（Product, Order, Review...）
    │   ├── pagination.ts       # 分页类型
    │   └── enums.ts            # 枚举常量
    │
    ├── api/                    # # API 接口层
    │   ├── request.ts          # Axios 实例 + 拦截器
    │   ├── auth.ts             # 认证相关 API
    │   ├── products.ts         # 商品相关 API
    │   ├── reviews.ts          # 评论相关 API
    │   ├── orders.ts           # 订单相关 API
    │   ├── checkout.ts         # 支付相关 API
    │   ├── inventory.ts        # 库存相关 API
    │   └── accounts.ts         # 账号相关 API
    │
    ├── stores/                 # # Pinia 状态管理
    │   ├── auth.ts             # 认证状态（token、用户信息）
    │   ├── product.ts          # 商品缓存/当前浏览
    │   └── cart.ts             # 购物车（下单用）
    │
    ├── router/                 # # 路由配置
    │   ├── index.ts            # 路由实例
    │   ├── routes.ts           # 路由表
    │   └── guards.ts           # 导航守卫（登录校验等）
    │
    ├── composables/            # # 组合式函数（可复用逻辑）
    │   ├── usePagination.ts    # 分页逻辑封装
    │   ├── useAuth.ts          # 认证相关逻辑
    │   └── useProductStock.ts  # 库存状态工具
    │
    ├── components/             # # 全局通用组件
    │   ├── AppHeader.vue       # 顶部导航栏
    │   ├── AppFooter.vue       # 页脚
    │   ├── ProductCard.vue     # 商品卡片（列表项）
    │   ├── ProductStockTag.vue # 库存状态标签
    │   ├── ReviewCard.vue      # 评论卡片
    │   ├── RatingStars.vue     # 星级评分组件
    │   ├── PaginationBar.vue   # 分页栏
    │   ├── ConfirmDialog.vue   # 确认弹窗
    │   └── EmptyState.vue      # 空状态占位
    │
    ├── layouts/                # # 布局组件
    │   ├── DefaultLayout.vue   # 默认布局（导航+内容+页脚）
    │   └── AuthLayout.vue      # 认证布局（登录/注册页）
    │
    ├── views/                  # # 页面组件
    │   ├── auth/
    │   │   ├── LoginPage.vue
    │   │   └── RegisterPage.vue
    │   ├── home/
    │   │   └── HomePage.vue        # 首页（推荐商品）
    │   ├── product/
    │   │   ├── ProductListPage.vue # 商品列表
    │   │   ├── ProductDetailPage.vue # 商品详情
    │   │   ├── ProductFormPage.vue # 商品创建/编辑
    │   │   └── components/
    │   │       ├── ProductFilters.vue  # 筛选栏
    │   │       └── ReviewSection.vue   # 评论区（详情页内嵌）
    │   ├── order/
    │   │   ├── OrderCreatePage.vue  # 下单页
    │   │   └── OrderListPage.vue    # 订单列表
    │   ├── payment/
    │   │   └── PaymentPage.vue      # 支付页
    │   ├── review/
    │   │   └── MyReviewsPage.vue    # 我的评论
    │   ├── inventory/
    │   │   ├── InventoryPage.vue    # 库存管理
    │   │   └── InventoryMovementsPage.vue # 库存流水
    │   └── account/
    │       └── AccountListPage.vue  # 账号列表
    │
    └── styles/
        ├── variables.scss      # SCSS 变量
        ├── global.scss         # 全局样式
        └── mixins.scss         # 混合宏
```

---

## 3. 路由设计

### 3.1 路由表

```typescript
// router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
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
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'Login', component: () => import('@/views/auth/LoginPage.vue') },
      { path: 'register', name: 'Register', component: () => import('@/views/auth/RegisterPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // 需要登录的页面
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
  // 公开页面
  {
    path: '/accounts',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'AccountList', component: () => import('@/views/account/AccountListPage.vue') },
    ],
  },
]
```

### 3.2 导航守卫

```typescript
// router/guards.ts
// 前置守卫：检查需认证页面的 token
router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})
```

### 3.3 路由对照表

| 路径 | 页面 | 认证 | 说明 |
|------|------|------|------|
| `/` | 首页 | 否 | 商品推荐、分类导航 |
| `/auth/login` | 登录页 | 否 | 登录表单 |
| `/auth/register` | 注册页 | 否 | 注册表单 |
| `/products` | 商品列表 | 否 | 搜索 + 分页 |
| `/products/new` | 创建商品 | 是 | 表单 |
| `/products/:id` | 商品详情 | 否 | 含评论、库存 |
| `/products/:id/edit` | 编辑商品 | 是 | 表单（预填） |
| `/orders/create` | 下单 | 是 | 选择商品+数量 |
| `/orders` | 订单列表 | 是 | 我的订单 |
| `/payment/:orderId` | 支付 | 是 | 跳转或扫码 |
| `/my/reviews` | 我的评论 | 是 | 评论管理 |
| `/inventory` | 库存管理 | 是 | 低库存+补货 |
| `/inventory/movements/:id` | 库存流水 | 是 | 变动记录 |
| `/accounts` | 账号列表 | 否 | 用户列表 |

---

## 4. 组件架构

### 4.1 通用组件设计

| 组件 | 职责 | Props 重点 |
|------|------|-----------|
| `AppHeader.vue` | 顶部导航：Logo、搜索框、登录/用户菜单 | - |
| `AppFooter.vue` | 页脚信息 | - |
| `ProductCard.vue` | 商品卡片：图片、名称、价格、库存标签 | `product: Product` |
| `ProductStockTag.vue` | 纯展示库存状态 | `status: StockStatus`, `displayText: string` |
| `ReviewCard.vue` | 评论信息 | `review: Review`, `showActions: boolean` |
| `RatingStars.vue` | 星级评分展示/输入 | `modelValue: number`, `readonly: boolean` |
| `PaginationBar.vue` | 分页导航 | `skip, take, total` → 自动计算页数 |
| `EmptyState.vue` | 空状态占位 | `icon, text, actionText` |
| `ProductFilters.vue` | 搜索结果筛选（暂只支持关键词，后续可扩展分类/价格区间） | `modelValue: FilterParams` |

### 4.2 组件层级结构

```
App.vue
├── AuthLayout.vue
│   └── LoginPage.vue / RegisterPage.vue
│
├── DefaultLayout.vue
│   ├── AppHeader.vue (搜索、导航、登录状态)
│   ├── <router-view> ── 页面内容
│   │   ├── HomePage.vue
│   │   │   └── ProductCard.vue[] (推荐商品)
│   │   │
│   │   ├── ProductListPage.vue
│   │   │   ├── ProductFilters.vue
│   │   │   ├── ProductCard.vue[]
│   │   │   └── PaginationBar.vue
│   │   │
│   │   ├── ProductDetailPage.vue
│   │   │   ├── ProductStockTag.vue
│   │   │   ├── RatingStars.vue
│   │   │   ├── ReviewSection.vue (内嵌组件)
│   │   │   │   ├── ReviewCard.vue[]
│   │   │   │   ├── PaginationBar.vue
│   │   │   │   └── ReviewFormDialog (创建/编辑评论)
│   │   │   └── OrderActionBar (立即购买、加入购物车)
│   │   │
│   │   ├── ProductFormPage.vue (创建/编辑)
│   │   │   └── ElForm + ElInput + ElInputNumber
│   │   │
│   │   ├── OrderCreatePage.vue
│   │   │   └── 商品选择 → 确认 → 创建
│   │   │
│   │   ├── PaymentPage.vue
│   │   │   └── 支付方式选择 → 跳转/扫码
│   │   │
│   │   ├── MyReviewsPage.vue
│   │   │   └── ReviewCard.vue[] + PaginationBar.vue
│   │   │
│   │   ├── InventoryPage.vue
│   │   │   ├── 低库存列表（ElTable）
│   │   │   └── RestockDialog (补货表单)
│   │   │
│   │   ├── InventoryMovementsPage.vue
│   │   │   └── 变动流水表格（ElTable + PaginationBar）
│   │   │
│   │   └── AccountListPage.vue
│   │       └── 用户列表（ElTable + PaginationBar）
│   │
│   └── AppFooter.vue
```

---

## 5. API 层设计

### 5.1 Axios 实例与拦截器

```typescript
// api/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动注入 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => response.data,   // 直接返回 data，调用方只关心业务数据
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.error?.message || '请求失败'

    switch (status) {
      case 401:
        // Token 过期/无效 → 清除 token 并跳转登录
        localStorage.removeItem('auth_token')
        router.push({ name: 'Login' })
        ElMessage.error('登录已过期，请重新登录')
        break
      case 403:
        ElMessage.error('无权操作')
        break
      case 404:
        ElMessage.warning('资源不存在')
        break
      case 409:
        ElMessage.warning(message)
        break
      case 400:
        ElMessage.warning(message)
        break
      default:
        ElMessage.error(message)
    }

    return Promise.reject(error)
  },
)

export default request
```

### 5.2 模块化 API 封装

每个模块一个文件，导出纯函数，返回值类型明确：

```typescript
// api/products.ts
import request from './request'
import type { Product, ProductDetail, StockInfo, PaginatedResponse } from '@/types'

export function getProducts(params: { skip?: number; take?: number; query?: string }) {
  return request.get<any, PaginatedResponse<Product>>('/api/v1/products', { params })
}

export function getProductById(id: string) {
  return request.get<any, { data: ProductDetail }>(`/api/v1/products/${id}`)
}

export function createProduct(data: { name: string; description: string; price: number }) {
  return request.post<any, { data: ProductDetail }>('/api/v1/products', data)
}

export function updateProduct(id: string, data: { name: string; description: string; price: number }) {
  return request.put<any, { data: ProductDetail }>(`/api/v1/products/${id}`, data)
}

export function deleteProduct(id: string) {
  return request.delete<any, { data: { success: boolean } }>(`/api/v1/products/${id}`)
}

export function getProductStock(id: string) {
  return request.get<any, { data: StockInfo }>(`/api/v1/products/${id}/stock`)
}
```

```typescript
// api/reviews.ts
export function getProductReviews(productId: string, params: ReviewQueryParams) { ... }
export function createReview(productId: string, data: ReviewInput) { ... }
export function getReviewStats(productId: string) { ... }
export function updateReview(productId: string, reviewId: number, data: ReviewInput) { ... }
export function deleteReview(productId: string, reviewId: number) { ... }
export function getMyReviews(params: SkipTakeParams) { ... }
export function likeReview(reviewId: number) { ... }
export function unlikeReview(reviewId: number) { ... }
export function getReplies(reviewId: number) { ... }
export function createReply(reviewId: number, content: string) { ... }
```

```typescript
// api/orders.ts
export function createOrder(data: OrderInput) { ... }
export function getMyOrders() { ... }
```

```typescript
// api/checkout.ts
export function createCheckoutSession(data: CheckoutInput) { ... }
export function createCustomerPortal(data: CustomerPortalInput) { ... }
```

```typescript
// api/inventory.ts
export function restock(data: { product_id: string; quantity: number; remark?: string }) { ... }
export function getLowStockProducts(params: SkipTakeParams) { ... }
export function getInventoryMovements(productId: string, params: SkipTakeParams) { ... }
```

```typescript
// api/auth.ts
export function login(data: { email: string; password: string }) { ... }
export function register(data: { name: string; email: string; password: string }) { ... }
```

```typescript
// api/accounts.ts
export function getAccounts(params: SkipTakeParams) { ... }
export function getAccountById(id: number) { ... }
```

---

## 6. 状态管理（Pinia）

### 6.1 认证 Store

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')
  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem('auth_token')
    router.push({ name: 'Login' })
  }

  return { token, isAuthenticated, setToken, logout }
})
```

### 6.2 商品 Store（可选，用于缓存）

```typescript
// stores/product.ts
// 可选缓存：商品列表的轻量缓存，避免重复请求
export const useProductStore = defineStore('product', () => {
  const currentProducts = ref<Product[]>([])
  const currentQuery = ref('')

  function setProducts(products: Product[], query?: string) {
    currentProducts.value = products
    if (query !== undefined) currentQuery.value = query
  }

  return { currentProducts, currentQuery, setProducts }
})
```

### 6.3 购物车 Store（下单用）

```typescript
// stores/cart.ts
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  function addItem(product: Product, quantity = 1) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ id: product.id, name: product.name, price: product.price, quantity })
    }
  }

  function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, totalPrice, addItem, removeItem, clear }
})
```

---

## 7. 认证与授权流程

### 7.1 登录/注册流程

```
[用户] → 填写表单 → POST /api/v1/auth/login
                         ↓
                   返回 { token }
                         ↓
           localStorage.setItem('auth_token', token)
                         ↓
              Pinia authStore.setToken(token)
                         ↓
           跳转到首页 / 之前的 redirect URL
```

### 7.2 Token 生命周期

```
登录成功 → 存 localStorage → 请求拦截器读取 → 附加 Authorization 头
                                                      ↓
                                          响应 401 → 清除 token → 跳转登录
```

### 7.3 权限控制

- **前端路由级**：`meta.requiresAuth` → 导航守卫检查 token
- **API 级**：请求头带 token，后端返回 401/403
- **UI 级**：`isAuthenticated` 控制"登录/注册"vs"用户菜单"的切换，以及"写评论""创建商品"等按钮的显示

---

## 8. 通用类型定义

```typescript
// types/models.ts

/** 商品（列表项） */
export interface Product {
  id: string
  name: string
  description: string
  price: number
  account_id: number
  stock: ProductStock
}

/** 商品库存状态 */
export interface ProductStock {
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown'
  available_qty: number
  display_text: string
}

/** 商品详情（含完整库存） */
export interface ProductDetail extends Product {}

/** 库存详情 */
export interface StockInfo {
  product_id: string
  total_qty: number
  reserved: number
  sold: number
  available_qty: number
  stock_status: string
  low_stock_threshold: number
}

/** 评论 */
export interface Review {
  id: number
  product_id: string
  user_id: number
  rating: number
  title?: string
  content: string
  is_verified: boolean
  status: string
  likes: number
  liked_by_me: boolean
  created_at: string
  updated_at: string
}

/** 评论回复 */
export interface Reply {
  id: number
  review_id: number
  user_id: number
  content: string
  created_at: string
}

/** 评分统计 */
export interface ReviewStats {
  product_id: string
  average_rating: number
  total_reviews: number
  rating_distribution: Record<number, number>
}

/** 订单 */
export interface Order {
  id: number
  account_id: number
  total_price: number
  products: OrderProduct[]
  created_at: string
}

export interface OrderProduct {
  id: string
  name: string
  price: number
  quantity: number
}

/** 账号 */
export interface Account {
  id: number
  name: string
  email: string
}
```

```typescript
// types/api.ts

/** 统一响应包裹（单数据） */
export interface ApiResponse<T> {
  data: T
}

/** 统一响应包裹（列表+分页） */
export interface PaginatedResponse<T> {
  data: T[]
  total?: number
  pagination: {
    skip: number
    take: number
  }
}

export interface SkipTakeParams {
  skip?: number
  take?: number
}

/** 评论查询参数 */
export interface ReviewQueryParams extends SkipTakeParams {
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_liked'
  rating?: number
  has_content?: boolean
}
```

```typescript
// types/enums.ts
export const STOCK_STATUS_MAP: Record<string, string> = {
  in_stock: '有货',
  low_stock: '库存不足',
  out_of_stock: '暂时缺货',
  unknown: '未知',
} as const

export const MOVEMENT_TYPE_MAP: Record<string, string> = {
  reservation: '预扣库存（下单）',
  deduction: '正式扣减（支付成功）',
  release: '释放预扣（取消订单）',
  restock: '补货入库',
  adjustment: '盘点调整',
} as const

export const PAYMENT_METHODS = ['alipay', 'wechat_pay'] as const
export type PaymentMethod = typeof PAYMENT_METHODS[number]
```

---

## 9. 页面详细设计

### 9.1 登录页 `/auth/login`

**功能：**
- 邮箱 + 密码登录表单
- 表单校验（邮箱格式、密码非空）
- 登录成功 → 存 token → 跳转 redirect 或首页
- 提供"没有账号？去注册"链接

**状态：**
| 状态 | 展示 |
|------|------|
| 初始 | 登录表单，按钮"登录" |
| 提交中 | 按钮 loading，禁用 |
| 失败 | ElMessage 显示错误（401 账号或密码错误） |
| 成功 | 跳转目标页 |

**API：** `POST /api/v1/auth/login`

---

### 9.2 注册页 `/auth/register`

**功能：**
- 用户名 + 邮箱 + 密码 + 确认密码
- 前端校验：用户名 2~100 字符、邮箱格式、密码≥6位、两次一致
- 已有账号？去登录

**异常处理：** 409 → "该邮箱已注册"

**API：** `POST /api/v1/auth/register`

---

### 9.3 首页 `/`

**功能：**
- 推荐商品展示（`GET /products/recommendations`）
- 已登录用户展示个性化推荐（`GET /products/recommendations/me`）
- 搜索入口 → 跳转 `/products?query=xxx`
- 商品卡片网格

**API：**
- `GET /api/v1/products/recommendations`（未登录）
- `GET /api/v1/products/recommendations/me`（已登录，自动带 JWT）

---

### 9.4 商品列表页 `/products`

**功能：**
- 搜索关键词高亮（从 URL query 读取初始值）
- 商品卡片列表
- 分页器（skip/take 控制）
- 搜索输入框（防抖 300ms）

**数据流：**
```
URL query (query, skip, take)
        ↓
  watchEffect 触发 API 请求
        ↓
  getProducts({ query, skip, take })
        ↓
  更新列表 + 分页信息
```

**API：** `GET /api/v1/products?query=&skip=0&take=20`

**状态：**
| 状态 | 展示 |
|------|------|
| 加载中 | Skeleton 骨架屏 |
| 空结果 | EmptyState: "没有找到相关商品" |
| 有数据 | ProductCard 列表 + 分页 |
| 错误 | ElMessage 提示 + 重试按钮 |

---

### 9.5 商品详情页 `/products/:id`

**功能与 API 组合：**

```
页面加载
  ├── GET /api/v1/products/:id           → 商品信息
  ├── GET /api/v1/products/:id/reviews?  → 评论列表（默认 5 条 + 查看更多）
  └── GET /api/v1/products/:id/reviews/stats → 评分统计
```

**页面结构：**
```
┌─────────────────────────────────────┐
│  商品名称        库存状态标签         │
│  描述                                │
│  ¥99.99     [加入购物车] [立即购买]   │
│  ─────────────────────────────────   │
│  评分统计：★★★★☆ 4.2 (50条评价)     │
│  ─────────────────────────────────   │
│  评论列表                            │
│   ├─ ★★★★★ "非常好用！" [点赞]       │
│   └─ ★★★★☆ "还不错"   [点赞]        │
│  [查看更多评论]                      │
└─────────────────────────────────────┘
```

**组件状态：**

**商品主信息：**
| 状态 | 展示 |
|------|------|
| 加载中 | Skeleton |
| 404 | EmptyState "商品不存在" |
| 正常 | 完整详情 |

**评论区：**
| 状态 | 展示 |
|------|------|
| 加载中 | Skeleton |
| 空 | "暂无评论，快来写第一条" |
| 有评论 | ReviewCard 列表 |
| 未登录 | "写评论"按钮 → 引导登录 |
| 已登录 | "写评论"按钮 → 弹出表单 |

---

### 9.6 创建/编辑商品页 `/products/new` / `/products/:id/edit`

**功能：**
- 表单：名称 (ElInput)、描述 (ElInput type="textarea")、价格 (ElInputNumber)
- 编辑模式：获取现有数据预填表单
- 表单校验：名称 ≤200、描述 ≤2000、价格 >0
- 创建成功 → 跳转商品详情
- 编辑成功 → 跳转商品详情

**API：** `POST /api/v1/products` / `PUT /api/v1/products/:id`

---

### 9.7 下单页 `/orders/create`

**流程：**
```
购物车（选择商品+数量）
    ↓
确认订单（展示商品清单 + 总价）
    ↓
点击"提交订单" → POST /api/v1/orders
    ↓
成功 → 跳转支付页 /payment/:orderId
失败 → ElMessage "库存不足"
```

**购物车数据：** 使用 Pinia cartStore，用于跨页面缓存

**API：** `POST /api/v1/orders`

---

### 9.8 支付页 `/payment/:orderId`

**功能：**
- 显示订单信息
- 支付方式选择（支付宝 / 微信支付）
- 点击"去支付" → `POST /api/v1/checkout/session`
- 根据返回的 `paymentUrl` 做 `window.location.href` 跳转

**UI 状态：**
| 状态 | 展示 |
|------|------|
| 未支付 | 支付方式选择 + 支付按钮 |
| 跳转中 | "正在跳转到支付页面..." |
| 失败 | ElMessage 提示重新尝试 |

**API：** `POST /api/v1/checkout/session`

---

### 9.9 我的评论页 `/my/reviews`

**功能：**
- 我的评论列表（分页）
- 每条评论可编辑/删除
- 删除需要二次确认

**API：**
- `GET /api/v1/me/reviews`
- `DELETE /api/v1/products/:id/reviews/:reviewId`
- `PUT /api/v1/products/:id/reviews/:reviewId`

---

### 9.10 库存管理页 `/inventory`

**功能：**
- 低库存商品列表（表格展示）
- 补货按钮 → 弹出补货对话框
- 点击商品 ID → 跳转库存流水页

**API：**
- `GET /api/v1/inventory/low-stock`
- `POST /api/v1/inventory/restock`

---

### 9.11 库存流水页 `/inventory/movements/:id`

**功能：**
- 某商品的全部库存变动记录
- 表格展示：变动类型、数量、时间等

**API：** `GET /api/v1/inventory/movements/:id`

---

### 9.12 账号列表页 `/accounts`

**功能：**
- 用户列表（表格展示）
- 分页

**API：** `GET /api/v1/accounts`

---

## 10. 错误处理与反馈

### 10.1 全局错误处理体系

```
API 响应
    ↓
Axios 响应拦截器
    ├── 200/201 → 返回 response.data（业务代码直接消费）
    ├── 401 → 清除 token、跳转登录
    ├── 403 → ElMessage.error('无权操作')
    ├── 404 → ElMessage.warning('资源不存在')
    └── 其他 → ElMessage.error(错误信息)
```

### 10.2 页面级错误处理策略

| 场景 | 处理方式 |
|------|---------|
| 列表加载失败 | ElMessage 提示 + 页面展示重试按钮 |
| 表单提交失败 | 表单保持原数据，ElMessage 提示具体原因 |
| 详情页 404 | 展示 EmptyState "内容不存在" |
| 网络断开 | Axios 超时 → "网络异常，请检查连接" |

### 10.3 空数据处理

- **空列表**：展示 `<EmptyState>` 组件，带友好文案和操作按钮
- **空搜索结果**：`未找到 "xxx" 相关的商品`
- **无评论**：`暂无评论，来写第一条吧`
- **无订单**：`还没有订单，去逛逛吧`

---

## 11. 性能优化建议

### 11.1 立即执行

| 策略 | 说明 |
|------|------|
| **组件懒加载** | 路由组件全部 `() => import()`，Vite 自动按需分割 |
| **图片懒加载** | Element Plus `ElImage` 原生支持 lazy，或使用 `v-lazy` |
| **防抖搜索** | 搜索输入框使用 300ms `debounce`，减少无效请求 |

### 11.2 后续可优化

| 策略 | 说明 |
|------|------|
| **API 缓存** | 商品列表短时间缓存（SWR 策略），返回时先展示缓存再异步更新 |
| **虚拟滚动** | 评论列表量大时可使用 `<ElTableV2>` 或 `vue-virtual-scroller` |
| **CDN 部署** | Vite build 产出静态资源上传 CDN，配置长期缓存 |
| **预加载** | 鼠标 hover 商品卡片时预加载详情页数据 |

---

## 12. 开发规范

### 12.1 代码组织

- 每个页面组件不超过 400 行，超长时拆分内联组件
- Composable 只做逻辑复用，不做数据共享（数据共享用 Pinia）
- API 函数命名与后端路径对应：`getProducts`, `createProduct`, `getProductById`
- 文件名统一：`kebab-case.vue`, `camelCase.ts`

### 12.2 类型安全

- 所有 API 响应必须有 TypeScript 类型
- 禁止在 `<script setup>` 中使用 `any`
- 使用 `defineProps` 类型声明，不用运行时校验

### 12.3 组件原则

- 展示组件：只通过 `props` 接收数据，通过 `emits` 通知事件
- 页面组件：调用 API、管理状态、组合展示组件
- 通用组件放在 `components/`，页面专属组件放在 `views/*/components/`

### 12.4 样式规范

- 使用 scoped scss
- 变量统一在 `styles/variables.scss` 中管理
- 复用 Element Plus 的设计令牌（CSS 变量）：通过覆盖 `--el-color-primary` 等实现主题

---

## 附录：API 速查表

| 页面 | API 端点 | 方法 | 认证 |
|------|----------|------|------|
| 注册 | `/api/v1/auth/register` | POST | 否 |
| 登录 | `/api/v1/auth/login` | POST | 否 |
| 商品列表 | `/api/v1/products` | GET | 否 |
| 商品搜索 | `/api/v1/products?query=` | GET | 否 |
| 商品详情 | `/api/v1/products/:id` | GET | 否 |
| 创建商品 | `/api/v1/products` | POST | 是 |
| 编辑商品 | `/api/v1/products/:id` | PUT | 是 |
| 删除商品 | `/api/v1/products/:id` | DELETE | 是 |
| 商品库存 | `/api/v1/products/:id/stock` | GET | 否 |
| 商品推荐 | `/api/v1/products/recommendations` | GET | 否 |
| 个性化推荐 | `/api/v1/products/recommendations/me` | GET | 是 |
| 评论列表 | `/api/v1/products/:id/reviews` | GET | 否 |
| 创建评论 | `/api/v1/products/:id/reviews` | POST | 是 |
| 评论统计 | `/api/v1/products/:id/reviews/stats` | GET | 否 |
| 评论详情 | `/api/v1/products/:id/reviews/:reviewId` | GET | 否 |
| 编辑评论 | `/api/v1/products/:id/reviews/:reviewId` | PUT | 是 |
| 删除评论 | `/api/v1/products/:id/reviews/:reviewId` | DELETE | 是 |
| 我的评论 | `/api/v1/me/reviews` | GET | 是 |
| 点赞评论 | `/api/v1/reviews/:reviewId/like` | POST | 是 |
| 取消点赞 | `/api/v1/reviews/:reviewId/like` | DELETE | 是 |
| 回复评论 | `/api/v1/reviews/:reviewId/replies` | POST | 是 |
| 查看回复 | `/api/v1/reviews/:reviewId/replies` | GET | 否 |
| 创建订单 | `/api/v1/orders` | POST | 是 |
| 订单列表 | `/api/v1/orders` | GET | 是 |
| 创建支付 | `/api/v1/checkout/session` | POST | 是 |
| 补货入库 | `/api/v1/inventory/restock` | POST | 是 |
| 低库存列表 | `/api/v1/inventory/low-stock` | GET | 是 |
| 库存流水 | `/api/v1/inventory/movements/:id` | GET | 是 |
| 账号列表 | `/api/v1/accounts` | GET | 否 |
| 账号详情 | `/api/v1/accounts/:id` | GET | 否 |
| 健康检查 | `/health` | GET | 否 |

---

> **文档版本：** v1.0  
> **基于 API 文档：** `api-docs.md`  
> **适用框架：** Vue 3.5+ / TypeScript / Vite / Element Plus / Pinia  
> **下一步：** 按此设计搭建项目脚手架，优先实现核心路径（登录→商品列表→详情→下单→支付）
