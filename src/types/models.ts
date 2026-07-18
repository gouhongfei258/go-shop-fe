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

/** 商品详情（与列表项结构一致，API 已聚合库存） */
export interface ProductDetail extends Product {}

/** 创建/编辑商品请求 */
export interface ProductInput {
  name: string
  description: string
  price: number
}

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

/** 低库存商品 */
export interface LowStockItem extends StockInfo {}

/** 库存变动记录 */
export interface InventoryMovement {
  id: number
  product_id: string
  order_id: string
  change_qty: number
  movement_type: MovementType
  reference_no: string
  remark: string
  created_at: string
}

export type MovementType = 'reservation' | 'deduction' | 'release' | 'restock' | 'adjustment'

/** 补货请求 */
export interface RestockInput {
  product_id: string
  quantity: number
  remark?: string
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

/** 创建/编辑评论请求 */
export interface ReviewInput {
  rating: number
  title?: string
  content: string
}

/** 评论查询参数 */
export interface ReviewQueryParams {
  skip?: number
  take?: number
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_liked'
  rating?: number
  has_content?: boolean
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

/** 订单商品 */
export interface OrderProduct {
  id: string
  name: string
  price: number
  quantity: number
}

/** 创建订单请求 */
export interface OrderInput {
  products: { id: string; quantity: number }[]
}

/** 账号 */
export interface Account {
  id: number
  name: string
  email: string
}

/** 支付会话请求 */
export interface CheckoutInput {
  accountId: number
  email: string
  name: string
  redirectUrl: string
  orderId: number
  products: { id: string; quantity: number }[]
  paymentMethod: 'alipay' | 'wechat_pay'
  currency?: string
}

/** 支付会话响应 */
export interface CheckoutSession {
  paymentUrl?: string
  qrCode?: string
  payInfo?: string
  transactionNo: string
}

/** 客户门户请求 */
export interface CustomerPortalInput {
  accountId: number
  email: string
  name: string
}

/** 登录请求 */
export interface LoginInput {
  email: string
  password: string
}

/** 注册请求 */
export interface RegisterInput {
  name: string
  email: string
  password: string
}

/** 认证响应 */
export interface AuthResponse {
  token: string
}

/** 商品推荐 */
export interface RecommendationQuery {
  viewedIds?: string[]
  skip?: number
  take?: number
}
