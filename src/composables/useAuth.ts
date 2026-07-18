import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  function requireAuth(): boolean {
    if (!authStore.isAuthenticated) {
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
      return false
    }
    return true
  }

  return {
    isAuthenticated: authStore.isAuthenticated,
    requireAuth,
  }
}
