import request from './request'
import type { ApiResponse, Account, SkipTakeParams, PaginatedResponse } from '@/types'

/** 账号列表 */
export function getAccounts(params: SkipTakeParams) {
  return request.get<any, PaginatedResponse<Account>>('/api/v1/accounts', { params })
}

/** 账号详情 */
export function getAccountById(id: number) {
  return request.get<any, ApiResponse<Account>>(`/api/v1/accounts/${id}`)
}
