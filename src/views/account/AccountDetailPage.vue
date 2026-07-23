<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { getAccountById } from '@/api/accounts'
import type { Account } from '@/types'

const route = useRoute()
const router = useRouter()

const account = ref<Account | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await getAccountById(id)
    account.value = res.data
  } catch {
    ElMessage.error('获取用户详情失败')
    router.push({ name: 'AccountList' })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container">
    <el-button text @click="router.push({ name: 'AccountList' })" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回用户列表
    </el-button>

    <div v-if="loading" class="section-card flex-center" style="padding: 64px">
      <el-skeleton animated style="width: 300px">
        <template #template>
          <el-skeleton-item variant="circle" style="width: 80px; height: 80px; display: block; margin: 0 auto" />
          <el-skeleton-item variant="text" style="width: 50%; margin: 12px auto" />
          <el-skeleton-item variant="text" style="width: 70%; margin: 0 auto" />
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="!account" class="section-card flex-center" style="padding: 64px">
      <el-empty description="用户不存在" />
    </div>

    <div v-else class="section-card account-detail">
      <div class="avatar-section">
        <el-avatar :size="80">U</el-avatar>
      </div>
      <h1 class="account-name">{{ account.name }}</h1>
      <p class="account-email">{{ account.email }}</p>
      <el-divider />
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">用户 ID</span>
          <span class="info-value">{{ account.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ account.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">邮箱</span>
          <span class="info-value">{{ account.email }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.back-btn {
  margin-bottom: 16px;
}

.account-detail {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.avatar-section {
  margin-bottom: 16px;
}

.account-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.account-email {
  font-size: 0.95rem;
  color: #909399;
}

.info-grid {
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
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
}
</style>
