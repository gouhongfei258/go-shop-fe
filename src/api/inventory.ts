import request from './request'
import type { ApiResponse, LowStockItem, InventoryMovement, RestockInput, SkipTakeParams } from '@/types'

/** 补货入库 */
export function restock(data: RestockInput) {
  return request.post<any, ApiResponse<{ product_id: string; total_qty: number; available_qty: number }>>('/api/v1/inventory/restock', data)
}

/** 低库存商品列表 */
export function getLowStockProducts(params: SkipTakeParams) {
  return request.get<any, { data: LowStockItem[]; total: number }>('/api/v1/inventory/low-stock', { params })
}

/** 库存变动流水 */
export function getInventoryMovements(productId: string, params: SkipTakeParams) {
  return request.get<any, { data: InventoryMovement[]; total: number }>(`/api/v1/inventory/movements/${productId}`, { params })
}
