<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'ProductList', query: { query: searchQuery.value.trim() } })
  }
}

function handleGoCart() {
  if (authStore.isAuthenticated) {
    router.push({ name: 'Cart' })
  } else {
    router.push({ name: 'Login', query: { redirect: '/cart' } })
  }
}

function handleLogout() {
  authStore.logout()
  cartStore.clear()
  router.push({ name: 'Login' })
}

const roleTagType: Record<string, 'info' | 'warning' | 'danger' | 'primary' | 'success'> = {
  buyer: 'info',
  seller: 'warning',
  admin: 'danger',
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-left">
        <div class="logo" @click="router.push({ name: 'Home' })">Go Shop</div>
        <nav class="nav-menu">
          <button
            class="nav-btn"
            :class="{ active: route.path === '/' }"
            @click="router.push({ name: 'Home' })"
          >首页</button>
          <button
            class="nav-btn"
            :class="{ active: route.path.startsWith('/products') }"
            @click="router.push({ name: 'ProductList' })"
          >商品</button>
          <button
            v-if="authStore.isAuthenticated"
            class="nav-btn"
            :class="{ active: route.path.startsWith('/orders') }"
            @click="router.push({ name: 'OrderList' })"
          >我的订单</button>
        </nav>
      </div>

      <div class="header-right">
        <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0" class="cart-badge">
          <el-button text size="small" class="cart-btn" @click="handleGoCart">
            <el-icon :size="20"><ShoppingCart /></el-icon>
          </el-button>
        </el-badge>

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
          <el-tag v-if="authStore.role !== 'buyer'" :type="roleTagType[authStore.role]" size="small" effect="plain">
            {{ authStore.role === 'seller' ? '卖家' : '管理员' }}
          </el-tag>
          <el-dropdown trigger="click">
            <el-button class="user-btn" text size="small">
              <el-icon><User /></el-icon>
              用户
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push({ name: 'Profile' })">
                  <el-icon style="margin-right: 6px"><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="router.push({ name: 'MyReviews' })">
                  我的评论
                </el-dropdown-item>
                <el-dropdown-item v-if="authStore.role === 'admin'" @click="router.push({ name: 'Inventory' })">
                  库存管理
                </el-dropdown-item>
                <el-dropdown-item v-if="authStore.role === 'seller' || authStore.role === 'admin'" @click="router.push({ name: 'ProductCreate' })">
                  发布商品
                </el-dropdown-item>
                <el-dropdown-item v-if="authStore.role === 'admin'" @click="router.push({ name: 'AccountList' })">
                  账号管理
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" size="small" @click="router.push({ name: 'Login' })">登录</el-button>
          <el-button size="small" @click="router.push({ name: 'Register' })">注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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
  height: 100%;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #409eff;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.nav-menu {
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 8px;
  gap: 2px;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  padding: 0 16px;
  height: 100%;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  transition: color 0.2s, border-color 0.2s;
  font-family: inherit;

  &:hover {
    color: #409eff;
  }

  &.active {
    color: #409eff;
    border-bottom-color: #409eff;
  }
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

.cart-badge {
  :deep(.el-badge__content) {
    font-size: 11px;
    height: 16px;
    line-height: 16px;
    padding: 0 5px;
  }
}

.cart-btn {
  color: #606266;
  &:hover {
    color: #409eff;
  }
}
</style>
