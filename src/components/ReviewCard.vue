<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { Review, Reply } from '@/types'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { likeReview, unlikeReview, getReplies, createReply } from '@/api/reviews'

const props = defineProps<{
  review: Review
  showActions?: boolean
}>()

const emit = defineEmits<{
  liked: [reviewId: number]
  delete: [reviewId: number]
}>()

const router = useRouter()
const authStore = useAuthStore()

const replies = ref<Reply[]>([])
const repliesVisible = ref(false)
const repliesLoading = ref(false)
const replyInput = ref('')
const replySubmitting = ref(false)

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

async function toggleReplies() {
  repliesVisible.value = !repliesVisible.value
  if (repliesVisible.value && replies.value.length === 0) {
    await fetchReplies()
  }
}

async function fetchReplies() {
  repliesLoading.value = true
  try {
    const res = await getReplies(props.review.id)
    replies.value = res?.data ?? []
  } catch {
    replies.value = []
  } finally {
    repliesLoading.value = false
  }
}

async function handleReply() {
  if (!replyInput.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  replySubmitting.value = true
  try {
    await createReply(props.review.id, replyInput.value.trim())
    ElMessage.success('回复成功')
    replyInput.value = ''
    await fetchReplies()
  } catch {
    // 错误在拦截器中处理
  } finally {
    replySubmitting.value = false
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
          size="small"
          text
          @click="toggleReplies"
        >
          <el-icon><ChatLineSquare /></el-icon>
          回复
        </el-button>
        <el-button
          :type="review.liked_by_me ? 'warning' : 'default'"
          size="small"
          text
          @click="handleLike"
        >
          <el-icon>
            <component :is="review.liked_by_me ? 'StarFilled' : 'Star'" />
          </el-icon>
          {{ review.likes ?? 0 }}
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

    <!-- 回复列表 -->
    <div v-if="repliesVisible" class="reply-section">
      <div v-if="repliesLoading" class="reply-loading">
        <el-skeleton :count="2" animated>
          <template #template>
            <div style="display: flex; gap: 8px; padding: 8px 0">
              <el-skeleton-item variant="circle" style="width: 24px; height: 24px" />
              <el-skeleton-item variant="text" style="flex: 1" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <div v-else-if="replies.length === 0" class="reply-empty">
        暂无回复
      </div>

      <div v-else class="reply-list">
        <div v-for="reply in replies" :key="reply.id" class="reply-item">
          <el-avatar :size="24">U</el-avatar>
          <div class="reply-body">
            <div class="reply-user">用户 {{ reply.user_id }}</div>
            <div class="reply-content">{{ reply.content }}</div>
            <div class="reply-time">{{ new Date(reply.created_at).toLocaleString('zh-CN') }}</div>
          </div>
        </div>
      </div>

      <!-- 回复输入 -->
      <div v-if="authStore.isAuthenticated" class="reply-input-wrap">
        <el-input
          v-model="replyInput"
          placeholder="写下你的回复..."
          size="small"
          :disabled="replySubmitting"
          @keyup.enter="handleReply"
        >
          <template #append>
            <el-button :loading="replySubmitting" @click="handleReply">发送</el-button>
          </template>
        </el-input>
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

.review-meta {
  display: flex;
  gap: 8px;
}

.review-actions {
  display: flex;
  gap: 4px;
}

// 回复区域
.reply-section {
  margin-top: 12px;
  padding-left: 40px;
  border-left: 2px solid #ebeef5;
}

.reply-loading {
  padding: 8px 0;
}

.reply-empty {
  font-size: 0.8rem;
  color: #c0c4cc;
  padding: 8px 0;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-item {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.reply-body {
  flex: 1;
}

.reply-user {
  font-size: 0.8rem;
  font-weight: 600;
  color: #606266;
}

.reply-content {
  font-size: 0.85rem;
  color: #303133;
  margin: 2px 0;
}

.reply-time {
  font-size: 0.7rem;
  color: #c0c4cc;
}

.reply-input-wrap {
  margin-top: 12px;
}
</style>
