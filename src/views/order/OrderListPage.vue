<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getMyOrders, cancelOrder } from '@/api/orders'
import type { Order } from '@/types'

const router = useRouter()
const orders = ref<Order[]>([])
const loading = ref(true)
const cancellingId = ref<number | null>(null)

const statusMap: Record<string, { type: 'info' | 'warning' | 'success' | 'danger'; label: string }> = {
  pending: { type: 'warning', label: '待处理' },
  confirmed: { type: 'info', label: '已确认' },
  shipped: { type: 'info', label: '已发货' },
  delivered: { type: 'success', label: '已送达' },
  cancelled: { type: 'danger', label: '已取消' },
}

const paymentStatusMap: Record<string, { type: 'info' | 'warning' | 'success' | 'danger'; label: string }> = {
  unpaid: { type: 'warning', label: '未支付' },
  paid: { type: 'success', label: '已支付' },
  refunded: { type: 'info', label: '已退款' },
}

function getStatusTag(s: string | undefined) {
  return statusMap[s ?? ''] ?? { type: 'info' as const, label: s || '未知' }
}

function getPaymentStatusTag(s: string | undefined) {
  return paymentStatusMap[s ?? ''] ?? { type: 'info' as const, label: s || '未知' }
}

onMounted(async () => {
  try {
    const res = await getMyOrders()
    orders.value = res?.data ?? []
  } catch {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
})

async function handleCancel(order: Order) {
  if (order.status === 'cancelled') return

  try {
    await ElMessageBox.confirm(
      `确定取消订单 #${order.id} 吗？`,
      '取消订单',
      { type: 'warning', confirmButtonText: '确定取消', cancelButtonText: '再想想' },
    )
  } catch {
    return
  }

  cancellingId.value = order.id
  try {
    await cancelOrder(order.id)
    ElMessage.success('订单已取消')
  } catch {
    // 错误在拦截器中处理
  } finally {
    cancellingId.value = null
    // 无论成功或失败，都重新从后端获取最新订单列表
    try {
      const res = await getMyOrders()
      orders.value = res?.data ?? []
    } catch {
      // 获取列表失败不影响主要流程
    }
  }
}
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
          <div class="order-header-left">
            <span class="order-id">订单 #{{ order.id }}</span>
            <span class="order-date">{{ new Date(order.created_at).toLocaleString('zh-CN') }}</span>
          </div>
          <div class="order-header-tags">
            <el-tag v-if="order.status" :type="getStatusTag(order.status).type" size="small">
              {{ getStatusTag(order.status).label }}
            </el-tag>
            <el-tag v-if="order.payment_status" :type="getPaymentStatusTag(order.payment_status).type" size="small">
              {{ getPaymentStatusTag(order.payment_status).label }}
            </el-tag>
          </div>
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
          <div class="order-actions">
            <el-button
              v-if="order.status === 'pending' || !order.status"
              size="small"
              :loading="cancellingId === order.id"
              @click="handleCancel(order)"
            >
              取消订单
            </el-button>
            <el-button
              v-if="order.payment_status !== 'paid'"
              type="primary"
              :disabled="order.status === 'cancelled'"
              @click="router.push({ name: 'Payment', params: { orderId: order.id } })"
            >
              去支付
            </el-button>
          </div>
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
  flex-wrap: wrap;
  gap: 8px;
}

.order-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-header-tags {
  display: flex;
  gap: 6px;
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

.order-actions {
  display: flex;
  gap: 8px;
}

.order-total {
  font-size: 1rem;
}
</style>
