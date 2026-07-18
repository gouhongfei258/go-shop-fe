import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

export function setupGuards(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
  })
}
