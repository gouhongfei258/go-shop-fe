<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getInventoryMovements } from '@/api/inventory'
import { usePagination } from '@/composables/usePagination'
import { MOVEMENT_TYPE_MAP } from '@/types/enums'
import type { InventoryMovement } from '@/types'

const route = useRoute()

const productId = computed(() => route.params.id as string)
const movements = ref<InventoryMovement[]>([])
const loading = ref(true)
const pagination = usePagination(20)

async function fetchMovements() {
  loading.value = true
  try {
    const res = await getInventoryMovements(productId.value, {
      skip: pagination.skip.value,
      take: pagination.take.value,
    })
    movements.value = res.data
    pagination.total.value = res.total ?? movements.value.length
  } catch {
    movements.value = []
  } finally {
    loading.value = false
  }
}

function getMovementTypeLabel(type: string): string {
  return MOVEMENT_TYPE_MAP[type] || type
}

function getChangeQtyClass(qty: number): string {
  return qty > 0 ? 'positive' : qty < 0 ? 'negative' : ''
}

onMounted(fetchMovements)
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">库存变动流水</h1>
    <p class="product-id-text">商品 ID：{{ productId }}</p>

    <div v-if="loading" class="section-card">
      <el-skeleton :count="3" animated>
        <template #template>
          <div style="padding: 12px 0">
            <el-skeleton-item variant="text" style="width: 60%" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="movements.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="暂无变动记录" />
    </div>

    <div v-else class="section-card">
      <el-table :data="movements" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="类型" width="160">
          <template #default="{ row }">
            <el-tag>{{ getMovementTypeLabel(row.movement_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变动数量" width="120">
          <template #default="{ row }">
            <span :class="getChangeQtyClass(row.change_qty)">
              {{ row.change_qty > 0 ? '+' : '' }}{{ row.change_qty }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reference_no" label="参考号" width="150" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
      </el-table>

      <PaginationBar
        :current-page="pagination.currentPage.value"
        :page-count="pagination.pageCount.value"
        :total="pagination.total.value"
        @update:current-page="(p) => { pagination.handlePageChange(p); fetchMovements() }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.product-id-text {
  font-size: 0.875rem;
  color: #909399;
  margin-bottom: 16px;
}

.positive {
  color: #67c23a;
  font-weight: 600;
}

.negative {
  color: #f56c6c;
  font-weight: 600;
}
</style>
