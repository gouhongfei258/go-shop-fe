<script setup lang="ts">
const props = withDefaults(defineProps<{
  currentPage: number
  pageCount: number
  total: number
  hasMore?: boolean
}>(), {
  hasMore: false,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

/** 当 hasMore 时，确保当前页后还有一页（显示下一页按钮） */
const effectivePageCount = computed(() => {
  if (props.hasMore) {
    return Math.max(props.pageCount, props.currentPage + 1)
  }
  return props.pageCount
})

function handleChange(page: number) {
  emit('update:currentPage', page)
}
</script>

<template>
  <div v-if="total > 0" class="pagination-bar">
    <el-pagination
      :current-page="currentPage"
      :page-size="20"
      :total="total"
      :page-count="effectivePageCount"
      layout="total, prev, pager, next"
      background
      small
      @current-change="handleChange"
    />
  </div>
</template>

<style scoped lang="scss">
.pagination-bar {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
