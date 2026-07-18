import request from './request'
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductDetail,
  ProductInput,
  StockInfo,
  RecommendationQuery,
} from '@/types'

/** 商品列表（含搜索） */
export function getProducts(params: { skip?: number; take?: number; query?: string }) {
  return request.get<any, PaginatedResponse<Product>>('/api/v1/products', { params })
}

/** 商品详情 */
export function getProductById(id: string) {
  return request.get<any, ApiResponse<ProductDetail>>(`/api/v1/products/${id}`)
}

/** 创建商品 */
export function createProduct(data: ProductInput) {
  return request.post<any, ApiResponse<ProductDetail>>('/api/v1/products', data)
}

/** 更新商品 */
export function updateProduct(id: string, data: ProductInput) {
  return request.put<any, ApiResponse<ProductDetail>>(`/api/v1/products/${id}`, data)
}

/** 删除商品 */
export function deleteProduct(id: string) {
  return request.delete<any, ApiResponse<{ success: boolean }>>(`/api/v1/products/${id}`)
}

/** 查询商品库存 */
export function getProductStock(id: string) {
  return request.get<any, ApiResponse<StockInfo>>(`/api/v1/products/${id}/stock`)
}

/** 商品推荐（基于浏览记录） */
export function getRecommendations(params: RecommendationQuery) {
  return request.get<any, PaginatedResponse<Product>>('/api/v1/products/recommendations', { params })
}

/** 个性化推荐（需登录） */
export function getPersonalizedRecommendations(params: { skip?: number; take?: number }) {
  return request.get<any, PaginatedResponse<Product>>('/api/v1/products/recommendations/me', { params })
}
