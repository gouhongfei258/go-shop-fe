<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps<{
  title?: string
  content?: string
}>()

async function confirm(): Promise<boolean> {
  try {
    await ElMessageBox.confirm(props.content || '确定执行此操作吗？', props.title || '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}

defineExpose({ confirm })
</script>

<template>
  <!-- 无模板，通过 expose 使用 -->
</template>
