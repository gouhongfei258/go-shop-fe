<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getRecommendations, getPersonalizedRecommendations } from '@/api/products'
import type { Product } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const products = ref<Product[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    if (authStore.isAuthenticated) {
      const res = await getPersonalizedRecommendations({ take: 20 })
      products.value = res.data
    } else {
      const res = await getRecommendations({ take: 20 })
      products.value = res.data
    }
  } catch {
    ElMessage.error('获取推荐商品失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container">
    <div class="hero-section">
      <h1 class="hero-title">欢迎来到 Go Shop</h1>
      <p class="hero-desc">发现你喜欢的商品</p>
      <el-button type="primary" size="large" @click="router.push({ name: 'ProductList' })">
        浏览全部商品
      </el-button>
    </div>

    <div class="section-card">
      <h2 class="section-title">
        {{ authStore.isAuthenticated ? '为你推荐' : '热门推荐' }}
      </h2>

      <div v-if="loading" class="loading-grid">
        <el-skeleton :count="4" animated>
          <template #template>
            <el-card style="height: 180px">
              <el-skeleton-item variant="image" style="width: 100%; height: 100px" />
              <div style="padding: 12px">
                <el-skeleton-item variant="text" style="width: 60%" />
                <el-skeleton-item variant="text" style="width: 40%" />
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </div>

      <div v-else-if="products.length === 0" class="flex-center" style="padding: 48px">
        <el-empty description="暂无推荐商品" />
      </div>

      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="grid-item">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hero-section {
  text-align: center;
  padding: 64px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  color: #fff;

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .hero-desc {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 24px;
  }
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.grid-item {
  min-width: 0;
}
</style>
