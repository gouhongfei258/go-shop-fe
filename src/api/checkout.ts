import request from './request'
import type { ApiResponse, CheckoutInput, CheckoutSession, CustomerPortalInput } from '@/types'

/** 创建支付会话 */
export function createCheckoutSession(data: CheckoutInput) {
  return request.post<any, ApiResponse<CheckoutSession>>('/api/v1/checkout/session', data)
}

/** 客户门户会话 */
export function createCustomerPortal(data: CustomerPortalInput) {
  return request.post<any, ApiResponse<any>>('/api/v1/customer-portal/session', data)
}
