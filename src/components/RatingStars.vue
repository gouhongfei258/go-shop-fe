<script setup lang="ts">
const model = defineModel<number>({ default: 0 })

const props = defineProps<{
  readonly?: boolean
}>()
</script>

<template>
  <el-rate
    v-model="model"
    :disabled="readonly"
    size="small"
    show-score
    score-template="{value} 分"
  />
</template>
