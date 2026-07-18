import request from './request'
import type { ApiResponse, Order, OrderInput } from '@/types'

/** 创建订单 */
export function createOrder(data: OrderInput) {
  return request.post<any, ApiResponse<Order>>('/api/v1/orders', data)
}

/** 我的订单列表 */
export function getMyOrders() {
  return request.get<any, ApiResponse<Order[]>>('/api/v1/orders')
}
