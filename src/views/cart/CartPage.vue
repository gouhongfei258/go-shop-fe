<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const selectedItems = ref<Set<string>>(new Set())
const removingItems = ref<Set<string>>(new Set())

function toggleSelectAll() {
  if (selectedItems.value.size === cartStore.items.length) {
    selectedItems.value.clear()
  } else {
    selectedItems.value = new Set(cartStore.items.map((i) => i.id))
  }
}

function toggleSelect(id: string) {
  const next = new Set(selectedItems.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedItems.value = next
}

const selectedTotalPrice = computed(() =>
  cartStore.items
    .filter((i) => selectedItems.value.has(i.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0),
)

const selectedTotalCount = computed(() =>
  cartStore.items
    .filter((i) => selectedItems.value.has(i.id))
    .reduce((sum, item) => sum + item.quantity, 0),
)

const allSelected = computed(
  () => cartStore.items.length > 0 && selectedItems.value.size === cartStore.items.length,
)

async function handleQuantityUpdate(item: { id: string; quantity: number }, newQty: number) {
  if (newQty < 1) return
  try {
    await cartStore.updateQuantity(item.id, newQty)
  } catch {
    // 错误已在 store 中处理
  }
}

async function handleRemove(id: string) {
  removingItems.value.add(id)
  try {
    await cartStore.removeItem(id)
    selectedItems.value.delete(id)
    ElMessage.success('已移除')
  } catch {
    // 错误已在 store 中处理
  } finally {
    removingItems.value.delete(id)
  }
}

async function handleRemoveSelected() {
  if (selectedItems.value.size === 0) {
    ElMessage.warning('请选择要删除的商品')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedItems.value.size} 件商品吗？`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' },
    )
    for (const id of selectedItems.value) {
      await cartStore.removeItem(id)
    }
    selectedItems.value.clear()
    ElMessage.success('删除成功')
  } catch {
    // 取消
  }
}

async function handleCheckout() {
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }
  router.push({ name: 'OrderCreate' })
}

// 首次加载时若购物车为空则发起请求
onMounted(() => {
  if (cartStore.items.length === 0 && !cartStore.loading) {
    cartStore.fetchCart()
  }
})
</script>

<template>
  <div class="page-container">
    <div class="cart-header">
      <h1 class="page-title">购物车</h1>
      <el-button
        v-if="cartStore.items.length > 0"
        text
        type="danger"
        :loading="cartStore.loading"
        :disabled="selectedItems.size === 0"
        @click="handleRemoveSelected"
      >
        删除选中 ({{ selectedItems.size }})
      </el-button>
    </div>

    <!-- 加载骨架 -->
    <div v-if="cartStore.loading && cartStore.items.length === 0" class="section-card">
      <el-skeleton :count="3" animated>
        <template #template>
          <div style="display: flex; gap: 16px; padding: 16px 0; align-items: center">
            <el-skeleton-item variant="text" style="width: 20px; height: 20px" />
            <el-skeleton-item variant="text" style="width: 60px; height: 60px" />
            <div style="flex: 1">
              <el-skeleton-item variant="text" style="width: 40%" />
              <el-skeleton-item variant="text" style="width: 20%" />
            </div>
            <el-skeleton-item variant="text" style="width: 80px" />
            <el-skeleton-item variant="text" style="width: 50px" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="cartStore.error && cartStore.items.length === 0" class="section-card flex-center" style="padding: 48px">
      <el-result icon="error" title="加载失败" :sub-title="cartStore.error">
        <template #extra>
          <el-button type="primary" @click="cartStore.fetchCart()">重新加载</el-button>
        </template>
      </el-result>
    </div>

    <!-- 空购物车 -->
    <div v-else-if="cartStore.items.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="router.push({ name: 'ProductList' })">
          去逛逛
        </el-button>
      </el-empty>
    </div>

    <!-- 购物车列表 -->
    <template v-else>
      <div class="section-card cart-items-card">
        <!-- 全选栏 -->
        <div class="cart-select-all">
          <el-checkbox :model-value="allSelected" @change="toggleSelectAll">
            全选
          </el-checkbox>
          <span class="cart-count">共 {{ cartStore.totalCount }} 件商品</span>
        </div>

        <!-- 商品列表 -->
        <div class="cart-list">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item"
            :class="{ 'is-removing': removingItems.has(item.id) }"
          >
            <el-checkbox
              :model-value="selectedItems.has(item.id)"
              @change="toggleSelect(item.id)"
              class="item-checkbox"
            />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-price">&yen;{{ item.price.toFixed(2) }}</div>
            </div>
            <div class="item-quantity">
              <el-input-number
                :model-value="item.quantity"
                :min="1"
                :max="99"
                size="small"
                controls-position="right"
                :disabled="removingItems.has(item.id)"
                @update:model-value="(val: number | undefined) => handleQuantityUpdate(item, val ?? 1)"
              />
            </div>
            <div class="item-subtotal">
              <span class="subtotal-label">小计</span>
              <span class="subtotal-value">&yen;{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
            <div class="item-actions">
              <el-button
                text
                type="danger"
                size="small"
                :loading="removingItems.has(item.id)"
                @click="handleRemove(item.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="cart-footer section-card">
        <div class="footer-left">
          <el-checkbox :model-value="allSelected" @change="toggleSelectAll">
            全选
          </el-checkbox>
          <el-button text type="danger" :disabled="selectedItems.size === 0" @click="handleRemoveSelected">
            删除选中 ({{ selectedItems.size }})
          </el-button>
        </div>
        <div class="footer-right">
          <div class="footer-summary">
            <span class="summary-text">
              已选 <strong>{{ selectedTotalCount }}</strong> 件
            </span>
            <span class="summary-total">
              合计：<span class="total-price">&yen;{{ selectedTotalPrice.toFixed(2) }}</span>
            </span>
          </div>
          <el-button type="primary" size="large" @click="handleCheckout">
            去结算
          </el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cart-items-card {
  padding: 0;
  overflow: hidden;
}

.cart-select-all {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.cart-count {
  font-size: 0.85rem;
  color: #909399;
}

.cart-list {
  display: flex;
  flex-direction: column;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f2f3f5;
  transition: background 0.2s, opacity 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f5f7fa;
  }

  &.is-removing {
    opacity: 0.5;
    pointer-events: none;
  }
}

.item-checkbox {
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 0.85rem;
  color: #909399;
  margin-top: 4px;
}

.item-quantity {
  flex-shrink: 0;
  width: 120px;
}

.item-subtotal {
  flex-shrink: 0;
  min-width: 100px;
  text-align: right;

  .subtotal-label {
    font-size: 0.8rem;
    color: #909399;
    margin-right: 4px;
  }

  .subtotal-value {
    font-size: 1rem;
    font-weight: 600;
    color: #f56c6c;
  }
}

.item-actions {
  flex-shrink: 0;
  width: 60px;
  text-align: center;
}

// 底部固定栏
.cart-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-top: 16px;
  border-radius: 8px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-text {
  font-size: 0.9rem;
  color: #606266;
}

.summary-total {
  font-size: 0.95rem;
  color: #303133;
}

.total-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f56c6c;
}

@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
    gap: 8px;
  }

  .item-info {
    flex: 1 1 60%;
  }

  .item-quantity {
    width: 100px;
    margin-left: 36px;
  }

  .item-subtotal {
    margin-left: auto;
  }

  .cart-footer {
    flex-direction: column;
    gap: 12px;
  }

  .footer-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
