<script setup lang="ts">
import type { Review } from '@/types'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { likeReview, unlikeReview } from '@/api/reviews'

const props = defineProps<{
  review: Review
  showActions?: boolean
}>()

const emit = defineEmits<{
  liked: [reviewId: number]
  edit: [review: Review]
  delete: [reviewId: number]
}>()

const router = useRouter()
const authStore = useAuthStore()

async function handleLike() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login' })
    return
  }
  try {
    if (props.review.liked_by_me) {
      await unlikeReview(props.review.id)
      props.review.liked_by_me = false
      props.review.likes--
    } else {
      await likeReview(props.review.id)
      props.review.liked_by_me = true
      props.review.likes++
    }
    emit('liked', props.review.id)
  } catch {
    // 错误已在拦截器中处理
  }
}
</script>

<template>
  <div class="review-card">
    <div class="review-header">
      <div class="review-user">
        <el-avatar :size="32">U</el-avatar>
        <span class="username">用户 {{ review.user_id }}</span>
      </div>
      <div class="review-rating">
        <el-rate :model-value="review.rating" disabled size="small" />
        <span class="review-date">{{ new Date(review.created_at).toLocaleDateString('zh-CN') }}</span>
      </div>
    </div>

    <div v-if="review.title" class="review-title">{{ review.title }}</div>
    <p class="review-content">{{ review.content }}</p>

    <div class="review-footer">
      <div class="review-meta">
        <el-tag v-if="review.is_verified" type="success" size="small">已购买</el-tag>
      </div>
      <div class="review-actions">
        <el-button
          :type="review.liked_by_me ? 'primary' : 'default'"
          size="small"
          text
          @click="handleLike"
        >
          <el-icon><ThumbsUp /></el-icon>
          {{ review.likes || '点赞' }}
        </el-button>
        <el-button
          v-if="showActions"
          size="small"
          text
          @click="emit('edit', review)"
        >
          编辑
        </el-button>
        <el-button
          v-if="showActions"
          size="small"
          text
          type="danger"
          @click="emit('delete', review.id)"
        >
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.review-card {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 0.875rem;
  color: #606266;
}

.review-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.review-date {
  font-size: 0.75rem;
  color: #c0c4cc;
}

.review-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
}

.review-content {
  font-size: 0.875rem;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-actions {
  display: flex;
  gap: 4px;
}
</style>
