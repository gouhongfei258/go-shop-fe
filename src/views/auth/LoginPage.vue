<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { login } from '@/api/auth'
import type { LoginInput } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const form = reactive<LoginInput>({
  email: '',
  password: '',
})

const loading = ref(false)

async function handleLogin() {
  if (!form.email || !form.password) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const res = await login(form)
    authStore.setToken(res.data.token)
    // 登录后从后端加载购物车
    await cartStore.fetchCart()
    ElMessage.success('登录成功')

    const redirect = (router.currentRoute.value.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <h2 class="form-title">登录</h2>

    <el-form @submit.prevent="handleLogin">
      <el-form-item label="邮箱">
        <el-input
          v-model="form.email"
          type="email"
          placeholder="请输入邮箱"
          auto-complete="email"
        />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          auto-complete="current-password"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">
          登录
        </el-button>
      </el-form-item>
    </el-form>

    <div class="form-footer">
      还没有账号？
      <router-link :to="{ name: 'Register' }">立即注册</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-form {
  .form-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #303133;
    margin-bottom: 24px;
    text-align: center;
  }

  .submit-btn {
    width: 100%;
  }

  .form-footer {
    text-align: center;
    margin-top: 16px;
    font-size: 0.875rem;
    color: #909399;
  }
}
</style>
