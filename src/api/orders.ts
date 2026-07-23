import request from './request'
import type { ApiResponse, Order, OrderInput, OrderProduct } from '@/types'

/** 后端返回的订单原始结构（无 json tag，字段名大写/驼峰） */
interface RawOrder {
  ID?: number
  CreatedAt?: string
  TotalPrice?: number
  AccountID?: number
  Status?: string
  PaymentStatus?: string
  Products?: RawProduct[] | null
}

interface RawProduct {
  ID?: string
  Name?: string
  Price?: number
  Quantity?: number
}

/** 将后端原始订单映射为前端扁平结构 */
function flattenOrder(raw: RawOrder): Order {
  return {
    id: raw.ID ?? 0,
    created_at: raw.CreatedAt ?? '',
    total_price: raw.TotalPrice ?? 0,
    account_id: raw.AccountID ?? 0,
    status: raw.Status ?? '',
    payment_status: raw.PaymentStatus ?? '',
    products: (raw.Products ?? []).map(flattenProduct),
  }
}

function flattenProduct(raw: RawProduct): OrderProduct {
  return {
    id: raw.ID ?? '',
    name: raw.Name ?? '',
    price: raw.Price ?? 0,
    quantity: raw.Quantity ?? 0,
  }
}

/** 创建订单 */
export function createOrder(data: OrderInput) {
  return request.post<any, ApiResponse<RawOrder>>('/api/v1/orders', data).then((res) => {
    if (res?.data) {
      return { ...res, data: flattenOrder(res.data) } as ApiResponse<Order>
    }
    return res as any as ApiResponse<Order>
  })
}

/** 我的订单列表 */
export function getMyOrders() {
  return request.get<any, ApiResponse<RawOrder[]>>('/api/v1/orders').then((res) => {
    if (res?.data && Array.isArray(res.data)) {
      return { ...res, data: res.data.map(flattenOrder) } as ApiResponse<Order[]>
    }
    return res as any as ApiResponse<Order[]>
  })
}

/** 取消订单 */
export function cancelOrder(orderId: number) {
  return request.patch<any, ApiResponse<{ status: string }>>(`/api/v1/orders/${orderId}/cancel`)
}
