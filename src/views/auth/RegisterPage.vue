<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { register } from '@/api/auth'
import type { RegisterInput } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)

async function handleRegister() {
  if (!form.name || !form.email || !form.password) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (form.name.length < 2 || form.name.length > 100) {
    ElMessage.warning('用户名长度需要 2~100 字符')
    return
  }
  if (form.password.length < 6) {
    ElMessage.warning('密码至少 6 位')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }

  loading.value = true
  try {
    const res = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    authStore.setToken(res.data.token)
    ElMessage.success('注册成功')
    router.push({ name: 'Home' })
  } catch {
    // 错误在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <h2 class="form-title">注册</h2>

    <el-form @submit.prevent="handleRegister">
      <el-form-item label="用户名">
        <el-input
          v-model="form.name"
          placeholder="2~100 字符"
          auto-complete="username"
        />
      </el-form-item>
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
          placeholder="至少 6 位"
          show-password
          auto-complete="new-password"
        />
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="再次输入密码"
          show-password
          auto-complete="new-password"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">
          注册
        </el-button>
      </el-form-item>
    </el-form>

    <div class="form-footer">
      已有账号？
      <router-link :to="{ name: 'Login' }">去登录</router-link>
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
