import request from './request'
import type { ApiResponse, AuthResponse, LoginInput, RegisterInput } from '@/types'

export function login(data: LoginInput) {
  return request.post<any, ApiResponse<AuthResponse>>('/api/v1/auth/login', data)
}

export function register(data: RegisterInput) {
  return request.post<any, ApiResponse<AuthResponse>>('/api/v1/auth/register', data)
}
