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

/**
 * 后端商品列表返回格式为:
 * { "product": { id, name, description, price, accountID }, "stock": { status, available_qty, display_text } }
 * 前端 Product 类型期望扁平结构，此函数做展平转换。
 */
function flattenProduct(item: any): Product {
  const p = item?.product ?? item
  const s = item?.stock
  return {
    id: p?.id ?? '',
    name: p?.name ?? '',
    description: p?.description ?? '',
    price: p?.price ?? 0,
    account_id: p?.accountID ?? p?.account_id ?? 0,
    stock: {
      status: s?.status ?? 'unknown',
      available_qty: s?.available_qty ?? 0,
      display_text: s?.display_text ?? '未知',
    },
  }
}

function flattenProductDetail(item: any): ProductDetail {
  return flattenProduct(item) as ProductDetail
}

/** 商品列表（含搜索） */
export function getProducts(params: { skip?: number; take?: number; query?: string }) {
  return request.get<any, PaginatedResponse<Product>>('/api/v1/products', { params }).then((res) => {
    if (res?.data && Array.isArray(res.data)) {
      res.data = res.data.map(flattenProduct)
    }
    return res
  })
}

/** 商品详情 */
export function getProductById(id: string) {
  return request.get<any, ApiResponse<ProductDetail>>(`/api/v1/products/${id}`).then((res) => {
    if (res?.data) {
      res.data = flattenProductDetail(res.data)
    }
    return res
  })
}

/** 创建商品 */
export function createProduct(data: ProductInput) {
  return request.post<any, ApiResponse<ProductDetail>>('/api/v1/products', data).then((res) => {
    if (res?.data) {
      res.data = flattenProductDetail(res.data)
    }
    return res
  })
}

/** 更新商品 */
export function updateProduct(id: string, data: ProductInput) {
  return request.put<any, ApiResponse<ProductDetail>>(`/api/v1/products/${id}`, data).then((res) => {
    if (res?.data) {
      res.data = flattenProductDetail(res.data)
    }
    return res
  })
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
  return request.get<any, PaginatedResponse<Product>>('/api/v1/products/recommendations', { params }).then((res) => {
    if (res?.data && Array.isArray(res.data)) {
      res.data = res.data.map(flattenProduct)
    }
    return res
  })
}

/** 个性化推荐（需登录） */
export function getPersonalizedRecommendations(params: { skip?: number; take?: number }) {
  return request.get<any, PaginatedResponse<Product>>('/api/v1/products/recommendations/me', { params }).then((res) => {
    if (res?.data && Array.isArray(res.data)) {
      res.data = res.data.map(flattenProduct)
    }
    return res
  })
}
