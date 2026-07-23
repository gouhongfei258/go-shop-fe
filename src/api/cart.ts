import request from './request'
import type { ApiResponse } from '@/types'

/** 后端返回的购物车条目原始结构 */
export interface BackendCartItem {
  id: number
  user_id?: number
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  created_at?: string
  updated_at?: string
}

/** 后端 GET /api/v1/cart 响应中的 data 结构（proto 序列化结果） */
export interface CartListData {
  items?: BackendCartItem[]
  total_items?: number
}

/** 获取购物车列表 */
export function getCart() {
  return request.get<any, ApiResponse<CartListData>>('/api/v1/cart')
}

/** 添加商品到购物车 */
export function addCartItem(productId: string, quantity: number) {
  return request.post<any, ApiResponse<BackendCartItem>>('/api/v1/cart', {
    product_id: productId,
    quantity,
  })
}

/** 更新购物车商品数量（:id 为购物车条目 ID） */
export function updateCartItemQuantity(itemId: number, quantity: number) {
  return request.put<any, ApiResponse<BackendCartItem>>(`/api/v1/cart/${itemId}`, {
    quantity,
  })
}

/** 删除购物车中的商品（:id 为购物车条目 ID） */
export function removeCartItem(itemId: number) {
  return request.delete<any, ApiResponse<{ success: boolean }>>(`/api/v1/cart/${itemId}`)
}

/** 清空购物车 */
export function clearCart() {
  return request.delete<any, ApiResponse<{ success: boolean }>>('/api/v1/cart')
}
