import request from './request'
import type { ApiResponse, Account, SkipTakeParams, PaginatedResponse } from '@/types'

/** 后端 Account 原始结构（ID 字段无 json tag → 大写，其余字段有 json tag → 小写） */
interface RawAccount {
  ID?: number
  name?: string
  email?: string
  role?: string
}

function flattenAccount(raw: RawAccount): Account {
  return {
    id: raw.ID ?? 0,
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role,
  }
}

/** 账号列表 */
export function getAccounts(params: SkipTakeParams) {
  return request.get<any, PaginatedResponse<RawAccount>>('/api/v1/accounts', { params }).then((res) => {
    if (res?.data && Array.isArray(res.data)) {
      return { ...res, data: res.data.map(flattenAccount) } as unknown as PaginatedResponse<Account>
    }
    return res as unknown as PaginatedResponse<Account>
  })
}

/** 账号详情 */
export function getAccountById(id: number) {
  return request.get<any, ApiResponse<RawAccount>>(`/api/v1/accounts/${id}`).then((res) => {
    if (res?.data) {
      return { ...res, data: flattenAccount(res.data) } as ApiResponse<Account>
    }
    return res as unknown as ApiResponse<Account>
  })
}

/** 更新账号角色（管理员） */
export function updateAccountRole(id: number, role: string) {
  return request.patch<any, ApiResponse<RawAccount>>(`/api/v1/accounts/${id}/role`, { role }).then((res) => {
    if (res?.data) {
      return { ...res, data: flattenAccount(res.data) } as ApiResponse<Account>
    }
    return res as unknown as ApiResponse<Account>
  })
}

/** 获取当前登录用户信息 */
export function getMyProfile() {
  return request.get<any, ApiResponse<RawAccount>>('/api/v1/me/profile').then((res) => {
    if (res?.data) {
      return { ...res, data: flattenAccount(res.data) } as ApiResponse<Account>
    }
    return res as unknown as ApiResponse<Account>
  })
}
