<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyProfile } from '@/api/accounts'
import type { Account } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

/** 从 JWT 解码基础信息（始终可用） */
function decodeJWT() {
  const token = authStore.token
  if (!token) return { user_id: null, role: 'buyer' }
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return { user_id: decoded.user_id ?? null, role: decoded.role || 'buyer' }
  } catch {
    return { user_id: null, role: 'buyer' }
  }
}

const jwtInfo = decodeJWT()
const profile = ref<Account | null>(null)
const loading = ref(true)
const apiFailed = ref(false)

const roleLabels: Record<string, string> = {
  buyer: '买家',
  seller: '卖家',
  admin: '管理员',
}

const roleTagType: Record<string, 'info' | 'warning' | 'danger' | 'primary' | 'success'> = {
  buyer: 'info',
  seller: 'warning',
  admin: 'danger',
}

// 显示用的响应式数据 —— 优先用 API 数据，降级用 JWT
const displayName = ref(jwtInfo.user_id ? `用户 #${jwtInfo.user_id}` : '用户')
const displayEmail = ref('')
const displayId = ref(jwtInfo.user_id ?? '—')

onMounted(async () => {
  try {
    const res = await getMyProfile()
    profile.value = res.data
    if (res.data?.name) displayName.value = res.data.name
    if (res.data?.email) displayEmail.value = res.data.email
    if (res.data?.id) displayId.value = res.data.id
  } catch {
    apiFailed.value = true
  } finally {
    loading.value = false
  }
})

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}

interface QuickLink {
  name: string
  route: string
  icon: string
  desc: string
  condition?: boolean
}

const quickLinks = computed<QuickLink[]>(() => [
  { name: '购物车', route: 'Cart', icon: 'ShoppingCart', desc: '查看购物车中的商品' },
  { name: '我的订单', route: 'OrderList', icon: 'List', desc: '查看和管理你的订单' },
  { name: '我的评论', route: 'MyReviews', icon: 'ChatLineSquare', desc: '查看和编辑你的评论' },
  { name: '发布商品', route: 'ProductCreate', icon: 'Plus', desc: '上架新商品', condition: authStore.role === 'seller' || authStore.role === 'admin' },
  { name: '库存管理', route: 'Inventory', icon: 'Box', desc: '管理商品库存', condition: authStore.role === 'admin' },
  { name: '账号管理', route: 'AccountList', icon: 'User', desc: '管理用户账号', condition: authStore.role === 'admin' },
])

const visibleLinks = computed(() => quickLinks.value.filter((l) => l.condition !== false))
</script>

<template>
  <div class="page-container">
    <div v-if="loading" class="section-card flex-center" style="padding: 64px">
      <el-skeleton animated style="width: 300px">
        <template #template>
          <el-skeleton-item variant="circle" style="width: 80px; height: 80px; display: block; margin: 0 auto" />
          <el-skeleton-item variant="text" style="width: 40%; margin: 12px auto" />
          <el-skeleton-item variant="text" style="width: 60%; margin: 0 auto" />
          <el-skeleton-item variant="text" style="width: 30%; margin: 8px auto" />
        </template>
      </el-skeleton>
    </div>

    <div v-else class="profile-content">
      <div class="section-card profile-header">
        <el-avatar :size="80" class="profile-avatar">
          {{ displayName.charAt(0).toUpperCase() }}
        </el-avatar>
        <h1 class="profile-name">{{ displayName }}</h1>
        <el-tag :type="roleTagType[authStore.role]" size="default" effect="plain">
          {{ roleLabels[authStore.role] || authStore.role }}
        </el-tag>

        <el-divider />

        <div class="profile-info-grid">
          <div class="info-row">
            <span class="info-label">用户 ID</span>
            <span class="info-value">{{ displayId }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ displayName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ displayEmail || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">角色</span>
            <span class="info-value">
              <el-tag :type="roleTagType[authStore.role]" size="small">
                {{ roleLabels[authStore.role] || authStore.role }}
              </el-tag>
            </span>
          </div>
        </div>

        <div v-if="apiFailed" style="margin-top: 16px">
          <el-alert
            title="无法从服务器获取完整信息，部分数据来自登录凭证"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
      </div>

      <div class="quick-links">
        <div
          v-for="link in visibleLinks"
          :key="link.route"
          class="link-card section-card"
          @click="router.push({ name: link.route })"
        >
          <div class="link-icon">
            <el-icon :size="28"><component :is="link.icon" /></el-icon>
          </div>
          <div class="link-info">
            <div class="link-name">{{ link.name }}</div>
            <div class="link-desc">{{ link.desc }}</div>
          </div>
          <el-icon class="link-arrow"><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="section-card logout-card" @click="handleLogout">
        <el-icon :size="20" color="#f56c6c"><SwitchButton /></el-icon>
        <span style="color: #f56c6c">退出登录</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-content {
  // container for non-loading state
}

.profile-header {
  text-align: center;
  padding: 40px 24px;
}

.profile-avatar {
  background: #409eff;
  font-size: 1.5rem;
  font-weight: 700;
}

.profile-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 12px 0 8px;
  color: #303133;
}

.profile-info-grid {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  color: #909399;
  font-size: 0.9rem;
}

.info-value {
  font-weight: 500;
  color: #303133;
  font-size: 0.95rem;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}

.link-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
  border-radius: 12px;
  color: #409eff;
  flex-shrink: 0;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-size: 1rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.link-desc {
  font-size: 0.85rem;
  color: #909399;
}

.link-arrow {
  color: #c0c4cc;
  flex-shrink: 0;
}

.logout-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #fef0f0;
  }
}
</style>
