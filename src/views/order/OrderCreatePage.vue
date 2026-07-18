<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { createOrder } from '@/api/orders'

const router = useRouter()
const cartStore = useCartStore()

const submitting = ref(false)

async function handleSubmit() {
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }

  submitting.value = true
  try {
    const res = await createOrder({
      products: cartStore.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    })
    ElMessage.success('订单创建成功')
    cartStore.clear()
    router.push({ name: 'Payment', params: { orderId: res.data.id } })
  } catch {
    // 错误在拦截器中处理（如库存不足 400）
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">确认订单</h1>

    <div v-if="cartStore.items.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="购物车为空">
        <el-button type="primary" @click="router.push({ name: 'ProductList' })">
          去逛逛
        </el-button>
      </el-empty>
    </div>

    <template v-else>
      <div class="section-card">
        <el-table :data="cartStore.items" stripe>
          <el-table-column prop="name" label="商品" />
          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              &yen;{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="99"
                size="small"
                controls-position="right"
                @change="cartStore.updateQuantity(row.id, row.quantity)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span style="color: #f56c6c; font-weight: 600">
                &yen;{{ (row.price * row.quantity).toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button text type="danger" @click="cartStore.removeItem(row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="order-summary section-card">
        <div class="summary-row">
          <span>商品数量：</span>
          <span>{{ cartStore.totalCount }} 件</span>
        </div>
        <div class="summary-row total">
          <span>合计：</span>
          <span class="total-price">&yen;{{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          style="width: 100%; margin-top: 16px"
          @click="handleSubmit"
        >
          提交订单
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.order-summary {
  max-width: 400px;
  margin-left: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.95rem;

  &.total {
    border-top: 1px solid #ebeef5;
    padding-top: 12px;
    font-size: 1.1rem;
    font-weight: 600;
  }
}

.total-price {
  color: #f56c6c;
  font-size: 1.3rem;
}
</style>
