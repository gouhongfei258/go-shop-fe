import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动注入 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      ElMessage.error('网络异常，请检查连接')
      return Promise.reject(error)
    }

    const status = error.response.status
    const message = error.response.data?.error?.message || '请求失败'

    switch (status) {
      case 401:
        localStorage.removeItem('auth_token')
        router.push({ name: 'Login' })
        ElMessage.error('登录已过期，请重新登录')
        break
      case 403:
        ElMessage.error('无权操作')
        break
      case 404:
        ElMessage.warning('资源不存在')
        break
      case 409:
        ElMessage.warning(message)
        break
      case 400:
        ElMessage.warning(message)
        break
      default:
        ElMessage.error(message)
    }

    return Promise.reject(error)
  },
)

export default request
