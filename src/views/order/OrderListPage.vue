<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getMyOrders } from '@/api/orders'
import type { Order } from '@/types'

const router = useRouter()
const orders = ref<Order[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getMyOrders()
    orders.value = res.data
  } catch {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">我的订单</h1>

    <div v-if="loading" class="section-card">
      <el-skeleton :count="3" animated>
        <template #template>
          <div style="padding: 16px 0">
            <el-skeleton-item variant="text" style="width: 40%" />
            <el-skeleton-item variant="text" />
            <el-skeleton-item variant="text" style="width: 20%" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="orders.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="还没有订单，去逛逛吧">
        <el-button type="primary" @click="router.push({ name: 'ProductList' })">
          去购物
        </el-button>
      </el-empty>
    </div>

    <div v-else class="orders-list">
      <el-card v-for="order in orders" :key="order.id" class="order-card" shadow="hover">
        <div class="order-header">
          <span class="order-id">订单 #{{ order.id }}</span>
          <span class="order-date">{{ new Date(order.created_at).toLocaleString('zh-CN') }}</span>
        </div>
        <el-divider style="margin: 12px 0" />
        <div class="order-products">
          <div v-for="item in order.products" :key="item.id" class="order-product">
            <span>{{ item.name }} x{{ item.quantity }}</span>
            <span>&yen;{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-total">
            合计：<strong>&yen;{{ order.total_price.toFixed(2) }}</strong>
          </span>
          <el-button type="primary" @click="router.push({ name: 'Payment', params: { orderId: order.id } })">
            去支付
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-weight: 600;
  font-size: 1rem;
}

.order-date {
  font-size: 0.85rem;
  color: #909399;
}

.order-product {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.9rem;
  color: #606266;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.order-total {
  font-size: 1rem;
}
</style>
