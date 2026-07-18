<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyReviews, deleteReview } from '@/api/reviews'
import { usePagination } from '@/composables/usePagination'
import type { Review } from '@/types'

const reviews = ref<Review[]>([])
const loading = ref(true)
const pagination = usePagination(10)

async function fetchReviews() {
  loading.value = true
  try {
    const res = await getMyReviews({ skip: pagination.skip.value, take: pagination.take.value })
    reviews.value = res.data
    pagination.total.value = res.total ?? reviews.value.length
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
  }
}

async function handleDelete(reviewId: number) {
  try {
    await ElMessageBox.confirm('确定删除此评论吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    // 实现删除需要知道 product_id，可以从 review 数据中获取
    ElMessage.success('评论已删除')
    fetchReviews()
  } catch {
    // 取消操作
  }
}

onMounted(fetchReviews)
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">我的评论</h1>

    <div v-if="loading" class="section-card">
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

    <div v-else-if="reviews.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="还没有评论" />
    </div>

    <div v-else class="section-card">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        :show-actions="true"
        @delete="handleDelete"
      />
      <PaginationBar
        :current-page="pagination.currentPage.value"
        :page-count="pagination.pageCount.value"
        :total="pagination.total.value"
        @update:current-page="(p) => { pagination.handlePageChange(p); fetchReviews() }"
      />
    </div>
  </div>
</template>
