<script setup lang="ts">
const props = defineProps<{
  status: string
  displayText: string
}>()
</script>

<template>
  <el-tag
    :type="
      status === 'in_stock'
        ? 'success'
        : status === 'low_stock'
          ? 'warning'
          : status === 'out_of_stock'
            ? 'danger'
            : 'info'
    "
    size="small"
  >
    {{ displayText }}
  </el-tag>
</template>
