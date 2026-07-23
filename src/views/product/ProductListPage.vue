<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { getProducts } from '@/api/products'
import { usePagination } from '@/composables/usePagination'
import type { Product } from '@/types'

const router = useRouter()
const route = useRoute()

const products = ref<Product[]>([])
const loading = ref(false)
const searchQuery = ref('')
/** 后端不返回 total，用 hasMore 追踪是否还有下一页 */
const hasMore = ref(false)

const pagination = usePagination(20)

async function fetchProducts() {
  loading.value = true
  try {
    const params: any = {
      skip: pagination.skip.value,
      take: pagination.take.value,
    }
    if (searchQuery.value) {
      params.query = searchQuery.value
    }
    const res = await getProducts(params)
    products.value = res?.data ?? []
    const count = products.value.length
    hasMore.value = count >= pagination.take.value
    pagination.total.value = pagination.skip.value + count
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.reset()
  fetchProducts()
}

function handlePageChange(page: number) {
  pagination.handlePageChange(page)
  fetchProducts()
}

// 从 URL 读取初始搜索参数
watchEffect(() => {
  const query = route.query.query as string
  if (query && query !== searchQuery.value) {
    searchQuery.value = query
    pagination.reset()
    fetchProducts()
  }
})

onMounted(() => {
  if (!route.query.query) {
    fetchProducts()
  }
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">商品列表</h1>

    <div class="section-card">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品名称或描述..."
          clearable
          size="large"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" size="large" @click="handleSearch">搜索</el-button>
        <el-button
          v-if="searchQuery"
          size="large"
          @click="searchQuery = ''; handleSearch()"
        >
          清除
        </el-button>
      </div>
    </div>

    <div class="section-card">
      <div v-if="loading" class="loading-list">
        <el-skeleton :count="5" animated>
          <template #template>
            <div style="display: flex; gap: 16px; padding: 16px 0">
              <el-skeleton-item variant="image" style="width: 120px; height: 120px" />
              <div style="flex: 1">
                <el-skeleton-item variant="text" style="width: 50%" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <div v-else-if="products.length === 0" class="flex-center" style="padding: 48px">
        <el-empty
          :description="searchQuery ? '未找到「' + searchQuery + '」相关的商品' : '暂无商品'"
        >
          <el-button v-if="searchQuery" type="primary" @click="searchQuery = ''; handleSearch()">
            查看全部商品
          </el-button>
        </el-empty>
      </div>

      <div v-else class="product-list">
        <div v-for="product in products" :key="product.id" class="product-item">
          <ProductCard :product="product" />
        </div>
      </div>

      <PaginationBar
        :current-page="pagination.currentPage.value"
        :page-count="pagination.pageCount.value"
        :total="pagination.total.value"
        :has-more="hasMore"
        @update:current-page="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-bar {
  display: flex;
  gap: 12px;

  .search-input {
    flex: 1;
    max-width: 500px;
  }
}

.loading-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
