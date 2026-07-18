<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'ProductList', query: { query: searchQuery.value.trim() } })
  }
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}

function goHome() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <el-header class="app-header">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo" @click="goHome">Go Shop</div>
        <el-menu
          :default-active="router.currentRoute.value.name as string"
          mode="horizontal"
          :ellipsis="false"
          class="header-menu"
        >
          <el-menu-item index="Home" @click="goHome">首页</el-menu-item>
          <el-menu-item index="ProductList" @click="router.push({ name: 'ProductList' })">
            商品
          </el-menu-item>
          <el-menu-item v-if="authStore.isAuthenticated" index="OrderList" @click="router.push({ name: 'OrderList' })">
            我的订单
          </el-menu-item>
        </el-menu>
      </div>

      <div class="header-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品..."
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <template v-if="authStore.isAuthenticated">
          <el-dropdown trigger="click">
            <el-button class="user-btn" text>
              <el-icon><User /></el-icon>
              用户
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push({ name: 'MyReviews' })">
                  我的评论
                </el-dropdown-item>
                <el-dropdown-item @click="router.push({ name: 'Inventory' })">
                  库存管理
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="router.push({ name: 'Login' })">登录</el-button>
          <el-button @click="router.push({ name: 'Register' })">注册</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<style scoped lang="scss">
.app-header {
  height: 60px !important;
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #409eff;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.header-menu {
  border-bottom: none !important;
  height: 60px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 220px;
}

.user-btn {
  font-size: 14px;
}
</style>
