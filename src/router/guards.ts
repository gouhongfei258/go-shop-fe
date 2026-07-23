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

    if (to.meta.requiresSeller && authStore.role !== 'seller' && authStore.role !== 'admin') {
      ElMessage.warning('仅卖家可访问此页面')
      return false
    }

    if (to.meta.requiresAdmin && authStore.role !== 'admin') {
      ElMessage.warning('仅管理员可访问此页面')
      return false
    }
  })
}
