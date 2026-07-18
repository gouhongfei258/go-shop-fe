<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  pageCount: number
  total: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

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
      :page-count="pageCount"
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
