<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getLowStockProducts, restock } from '@/api/inventory'
import { usePagination } from '@/composables/usePagination'
import type { LowStockItem } from '@/types'

const router = useRouter()

const items = ref<LowStockItem[]>([])
const loading = ref(true)
const pagination = usePagination(20)

const restockDialogVisible = ref(false)
const restockForm = reactive({
  product_id: '',
  quantity: 1,
  remark: '',
})
const restockSubmitting = ref(false)

async function fetchLowStock() {
  loading.value = true
  try {
    const res = await getLowStockProducts({ skip: pagination.skip.value, take: pagination.take.value })
    items.value = res.data
    pagination.total.value = res.total ?? items.value.length
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

function openRestockDialog(productId: string) {
  restockForm.product_id = productId
  restockForm.quantity = 1
  restockForm.remark = ''
  restockDialogVisible.value = true
}

async function submitRestock() {
  if (restockForm.quantity <= 0) {
    ElMessage.warning('补货数量必须大于 0')
    return
  }

  restockSubmitting.value = true
  try {
    await restock({
      product_id: restockForm.product_id,
      quantity: restockForm.quantity,
      remark: restockForm.remark || undefined,
    })
    ElMessage.success('补货成功')
    restockDialogVisible.value = false
    fetchLowStock()
  } catch {
    // 错误在拦截器中处理
  } finally {
    restockSubmitting.value = false
  }
}

function viewMovements(productId: string) {
  router.push({ name: 'InventoryMovements', params: { id: productId } })
}

onMounted(fetchLowStock)
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">库存管理</h1>

    <div v-if="loading" class="section-card">
      <el-skeleton :count="3" animated>
        <template #template>
          <div style="padding: 12px 0">
            <el-skeleton-item variant="text" style="width: 60%" />
            <el-skeleton-item variant="text" style="width: 40%" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="items.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="暂无低库存商品" />
    </div>

    <div v-else class="section-card">
      <el-table :data="items" stripe>
        <el-table-column prop="product_id" label="商品 ID" min-width="200">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewMovements(row.product_id)">
              {{ row.product_id }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="总库存" width="100">
          <template #default="{ row }">{{ row.total_qty }}</template>
        </el-table-column>
        <el-table-column label="可用" width="80">
          <template #default="{ row }">{{ row.available_qty }}</template>
        </el-table-column>
        <el-table-column label="已售" width="80">
          <template #default="{ row }">{{ row.sold }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag type="warning">低库存</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openRestockDialog(row.product_id)">
              补货
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <PaginationBar
        :current-page="pagination.currentPage.value"
        :page-count="pagination.pageCount.value"
        :total="pagination.total.value"
        @update:current-page="(p) => { pagination.handlePageChange(p); fetchLowStock() }"
      />
    </div>

    <!-- 补货弹窗 -->
    <el-dialog v-model="restockDialogVisible" title="补货入库" width="400px">
      <el-form>
        <el-form-item label="商品 ID">
          <el-input v-model="restockForm.product_id" disabled />
        </el-form-item>
        <el-form-item label="补货数量">
          <el-input-number
            v-model="restockForm.quantity"
            :min="1"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="restockForm.remark"
            placeholder="可选，如'采购入库'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="restockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="restockSubmitting" @click="submitRestock">
          确认补货
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
