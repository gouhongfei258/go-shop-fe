<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { getProductById, deleteProduct } from '@/api/products'
import { getProductReviews, createReview, getReviewStats, updateReview, deleteReview } from '@/api/reviews'
import { usePagination } from '@/composables/usePagination'
import type { ProductDetail, Review, ReviewInput, ReviewStats } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const product = ref<ProductDetail | null>(null)
const productLoading = ref(true)

const reviews = ref<Review[]>([])
const stats = ref<ReviewStats | null>(null)
const reviewsLoading = ref(true)

const reviewPagination = usePagination(5)

// 评论弹窗
const reviewDialogVisible = ref(false)
const editingReview = ref<Review | null>(null)
const reviewForm = reactive<ReviewInput>({
  rating: 5,
  title: '',
  content: '',
})
const reviewSubmitting = ref(false)

// 删除确认
async function confirmDelete() {
  if (!product.value) return
  try {
    await ElMessageBox.confirm('确定删除这个商品吗？此操作不可撤销。', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteProduct(product.value.id)
    ElMessage.success('删除成功')
    router.push({ name: 'ProductList' })
  } catch {
    // 取消或错误
  }
}

function handleEdit() {
  if (product.value) {
    router.push({ name: 'ProductEdit', params: { id: product.value.id } })
  }
}

async function fetchProduct() {
  productLoading.value = true
  try {
    const id = route.params.id as string
    const res = await getProductById(id)
    product.value = res.data
  } catch {
    product.value = null
  } finally {
    productLoading.value = false
  }
}

async function fetchReviews() {
  reviewsLoading.value = true
  try {
    const id = route.params.id as string
    const [reviewsRes, statsRes] = await Promise.all([
      getProductReviews(id, { skip: reviewPagination.skip.value, take: reviewPagination.take.value, sort: 'newest' }),
      getReviewStats(id),
    ])
    reviews.value = reviewsRes.data
    reviewPagination.total.value = reviewsRes.total ?? 0
    stats.value = statsRes.data
  } catch {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

function openCreateReview() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  editingReview.value = null
  reviewForm.rating = 5
  reviewForm.title = ''
  reviewForm.content = ''
  reviewDialogVisible.value = true
}

function openEditReview(review: Review) {
  editingReview.value = review
  reviewForm.rating = review.rating
  reviewForm.title = review.title || ''
  reviewForm.content = review.content
  reviewDialogVisible.value = true
}

async function submitReview() {
  if (!reviewForm.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  reviewSubmitting.value = true
  try {
    const id = route.params.id as string
    if (editingReview.value) {
      await updateReview(id, editingReview.value.id, reviewForm)
      ElMessage.success('评论已更新')
    } else {
      await createReview(id, reviewForm)
      ElMessage.success('评论发布成功')
    }
    reviewDialogVisible.value = false
    fetchReviews()
  } catch {
    // 错误在拦截器中处理
  } finally {
    reviewSubmitting.value = false
  }
}

async function handleDeleteReview(reviewId: number) {
  try {
    await ElMessageBox.confirm('确定删除此评论吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    const id = route.params.id as string
    await deleteReview(id, reviewId)
    ElMessage.success('评论已删除')
    fetchReviews()
  } catch {
    // 取消
  }
}

function addToCart() {
  if (product.value) {
    cartStore.addItem(product.value)
    ElMessage.success('已加入购物车')
  }
}

function goToOrder() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }
  if (product.value) {
    cartStore.addItem(product.value)
    router.push({ name: 'OrderCreate' })
  }
}

onMounted(() => {
  fetchProduct()
  fetchReviews()
})
</script>

<template>
  <div class="page-container">
    <!-- 商品信息 -->
    <div v-if="productLoading" class="section-card">
      <el-skeleton animated>
        <template #template>
          <div style="display: flex; gap: 24px">
            <el-skeleton-item variant="image" style="width: 300px; height: 300px" />
            <div style="flex: 1">
              <el-skeleton-item variant="h1" style="width: 50%" />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" />
              <el-skeleton-item variant="text" style="width: 30%" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="!product" class="section-card flex-center" style="padding: 64px">
      <el-empty description="商品不存在" />
    </div>

    <div v-else class="product-detail">
      <div class="section-card">
        <div class="detail-main">
          <div class="detail-image">
            <el-icon :size="80" color="#c0c4cc"><Picture /></el-icon>
          </div>
          <div class="detail-info">
            <h1 class="detail-name">{{ product.name }}</h1>
            <div class="detail-stock mt-sm">
              <ProductStockTag :status="product.stock.status" :display-text="product.stock.display_text" />
            </div>
            <div class="detail-price mt-md">&yen;{{ product.price.toFixed(2) }}</div>
            <p class="detail-desc mt-md">{{ product.description }}</p>

            <div class="detail-actions mt-lg">
              <el-button type="primary" size="large" @click="addToCart">
                加入购物车
              </el-button>
              <el-button type="danger" size="large" @click="goToOrder">
                立即购买
              </el-button>
            </div>

            <div v-if="authStore.isAuthenticated && authStore.token" class="detail-owner-actions mt-md">
              <el-button @click="handleEdit">编辑商品</el-button>
              <el-button type="danger" plain @click="confirmDelete">删除商品</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评分统计 -->
      <div v-if="stats" class="section-card">
        <div class="stats-summary">
          <div class="stats-average">
            <span class="stats-score">{{ stats.average_rating.toFixed(1) }}</span>
            <el-rate :model-value="stats.average_rating" disabled size="small" />
            <span class="stats-count">{{ stats.total_reviews }} 条评价</span>
          </div>
          <div class="stats-distribution">
            <div v-for="i in [5, 4, 3, 2, 1]" :key="i" class="stats-row">
              <span class="stats-label">{{ i }} 星</span>
              <el-progress
                :percentage="stats.total_reviews > 0 ? ((stats.rating_distribution[i] || 0) / stats.total_reviews) * 100 : 0"
                :stroke-width="8"
              />
              <span class="stats-count">{{ stats.rating_distribution[i] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="section-card">
        <div class="review-section-header">
          <h2 class="section-title">商品评论</h2>
          <el-button type="primary" @click="openCreateReview">写评论</el-button>
        </div>

        <div v-if="reviewsLoading" class="mt-md">
          <el-skeleton :count="3" animated>
            <template #template>
              <div style="padding: 16px 0">
                <el-skeleton-item variant="text" style="width: 30%" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" style="width: 60%" />
              </div>
            </template>
          </el-skeleton>
        </div>

        <div v-else-if="reviews.length === 0" class="flex-center" style="padding: 32px">
          <el-empty description="暂无评论，来写第一条吧" />
        </div>

        <div v-else class="review-list">
          <ReviewCard
            v-for="review in reviews"
            :key="review.id"
            :review="review"
            :show-actions="authStore.isAuthenticated"
            @edit="openEditReview"
            @delete="handleDeleteReview"
          />
        </div>

        <PaginationBar
          :current-page="reviewPagination.currentPage.value"
          :page-count="reviewPagination.pageCount.value"
          :total="reviewPagination.total.value"
          @update:current-page="(p) => { reviewPagination.handlePageChange(p); fetchReviews() }"
        />
      </div>
    </div>

    <!-- 评论弹窗 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="editingReview ? '编辑评论' : '写评论'"
      width="500px"
    >
      <el-form>
        <el-form-item label="评分">
          <el-rate v-model="reviewForm.rating" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="reviewForm.title" placeholder="可选，最多 200 字符" maxlength="200" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="分享你的使用体验..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewSubmitting" @click="submitReview">
          {{ editingReview ? '保存' : '发布' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.detail-main {
  display: flex;
  gap: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.detail-image {
  width: 300px;
  height: 300px;
  background: #f5f7fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
}

.detail-info {
  flex: 1;
}

.detail-name {
  font-size: 1.5rem;
  font-weight: 700;
}

.detail-price {
  font-size: 2rem;
  font-weight: 700;
  color: #f56c6c;
}

.detail-desc {
  font-size: 0.95rem;
  color: #606266;
  line-height: 1.6;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 600;
}

// 评分统计
.stats-summary {
  display: flex;
  gap: 40px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
}

.stats-average {
  text-align: center;
  min-width: 120px;
}

.stats-score {
  font-size: 3rem;
  font-weight: 700;
  color: #303133;
  display: block;
}

.stats-count {
  font-size: 0.8rem;
  color: #909399;
}

.stats-distribution {
  flex: 1;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.stats-label {
  width: 40px;
  font-size: 0.85rem;
  text-align: right;
  white-space: nowrap;
}

.stats-row .el-progress {
  flex: 1;
}

// 评论区
.review-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
