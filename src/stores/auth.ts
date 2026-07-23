import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'buyer' | 'seller' | 'admin'

/** 解码 JWT payload（不验证签名，仅前端展示用） */
function decodeJWT(token: string): { user_id?: number; role?: string } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')

  const role = computed<UserRole>(() => {
    if (!token.value) return 'buyer'
    const payload = decodeJWT(token.value)
    const r = payload?.role
    if (r === 'seller' || r === 'admin') return r
    return 'buyer'
  })

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem('auth_token')
  }

  return { token, role, isAuthenticated, setToken, logout }
})
