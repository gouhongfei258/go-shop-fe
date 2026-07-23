import request from './request'
import type { ApiResponse, CheckoutInput, CheckoutSession } from '@/types'

/** 创建支付会话 */
export function createCheckoutSession(data: CheckoutInput) {
  return request.post<any, ApiResponse<CheckoutSession>>('/api/v1/checkout/session', data)
}
