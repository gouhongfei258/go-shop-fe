<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { createCheckoutSession } from '@/api/checkout'
import type { PaymentMethod } from '@/types'

const route = useRoute()

const orderId = computed(() => route.params.orderId as string)
const paymentMethod = ref<PaymentMethod>('alipay')
const loading = ref(false)

async function handlePay() {
  loading.value = true
  try {
    const res = await createCheckoutSession({
      accountId: 0, // 由后端从 JWT 识别
      email: '',
      name: '',
      redirectUrl: window.location.origin,
      orderId: Number(orderId.value),
      products: [],
      paymentMethod: paymentMethod.value,
    })

    if (res.data.paymentUrl) {
      ElMessage.success('正在跳转到支付页面...')
      window.location.href = res.data.paymentUrl
    } else if (res.data.qrCode) {
      ElMessage.info('请使用支付工具扫码')
      // TODO: 展示二维码
    } else {
      ElMessage.success('支付会话已创建')
    }
  } catch {
    // 错误在拦截器中处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container flex-center" style="min-height: 60vh">
    <div class="section-card payment-card">
      <h1 class="page-title" style="text-align: center">支付订单</h1>

      <el-divider />

      <div class="order-info">
        <p>订单编号：<strong>{{ orderId }}</strong></p>
      </div>

      <div class="payment-methods mt-lg">
        <h3>选择支付方式</h3>
        <el-radio-group v-model="paymentMethod" class="mt-sm">
          <el-radio-button value="alipay">支付宝</el-radio-button>
          <el-radio-button value="wechat_pay">微信支付</el-radio-button>
        </el-radio-group>
      </div>

      <el-button
        type="primary"
        size="large"
        :loading="loading"
        style="width: 100%; margin-top: 24px"
        @click="handlePay"
      >
        去支付
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.payment-card {
  width: 480px;
  max-width: 100%;
}

.order-info {
  text-align: center;
  font-size: 1rem;
  color: #606266;
}

.payment-methods {
  text-align: center;
}
</style>
