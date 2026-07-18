<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="auth-layout flex-center">
    <div class="auth-card">
      <div class="auth-logo" @click="router.push({ name: 'Home' })">Go Shop</div>
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.auth-card {
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.auth-logo {
  font-size: 1.8rem;
  font-weight: 700;
  color: #409eff;
  text-align: center;
  margin-bottom: 32px;
  cursor: pointer;
  user-select: none;
}
</style>
