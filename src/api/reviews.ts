import request from './request'
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  ReviewInput,
  ReviewQueryParams,
  ReviewStats,
  Reply,
  SkipTakeParams,
} from '@/types'

/** 商品评论列表 */
export function getProductReviews(productId: string, params: ReviewQueryParams) {
  return request.get<any, PaginatedResponse<Review> & { total: number }>(`/api/v1/products/${productId}/reviews`, { params })
}

/** 创建评论 */
export function createReview(productId: string, data: ReviewInput) {
  return request.post<any, ApiResponse<Review>>(`/api/v1/products/${productId}/reviews`, data)
}

/** 评分统计 */
export function getReviewStats(productId: string) {
  return request.get<any, ApiResponse<ReviewStats>>(`/api/v1/products/${productId}/reviews/stats`)
}

/** 评论详情 */
export function getReviewDetail(productId: string, reviewId: number) {
  return request.get<any, ApiResponse<Review>>(`/api/v1/products/${productId}/reviews/${reviewId}`)
}

/** 编辑评论 */
export function updateReview(productId: string, reviewId: number, data: ReviewInput) {
  return request.put<any, ApiResponse<Review>>(`/api/v1/products/${productId}/reviews/${reviewId}`, data)
}

/** 删除评论 */
export function deleteReview(productId: string, reviewId: number) {
  return request.delete<any, ApiResponse<{ success: boolean }>>(`/api/v1/products/${productId}/reviews/${reviewId}`)
}

/** 我的评论列表 */
export function getMyReviews(params: SkipTakeParams) {
  return request.get<any, PaginatedResponse<Review> & { total: number }>('/api/v1/me/reviews', { params })
}

/** 点赞评论 */
export function likeReview(reviewId: number) {
  return request.post<any, ApiResponse<{ success: boolean }>>(`/api/v1/reviews/${reviewId}/like`)
}

/** 取消点赞 */
export function unlikeReview(reviewId: number) {
  return request.delete<any, ApiResponse<{ success: boolean }>>(`/api/v1/reviews/${reviewId}/like`)
}

/** 查看评论回复 */
export function getReplies(reviewId: number) {
  return request.get<any, ApiResponse<Reply[]>>(`/api/v1/reviews/${reviewId}/replies`)
}

/** 回复评论 */
export function createReply(reviewId: number, content: string) {
  return request.post<any, ApiResponse<Reply>>(`/api/v1/reviews/${reviewId}/replies`, { content })
}
