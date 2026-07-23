<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

// 登录后自动加载购物车
onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})
</script>

<template>
  <div class="default-layout">
    <AppHeader />
    <main class="main-content">
      <router-view :key="route.fullPath" />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
