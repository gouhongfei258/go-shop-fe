<script setup lang="ts">
defineProps<{
  icon?: string
  text?: string
  actionText?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state flex-center">
    <el-empty :description="text || '暂无数据'">
      <template #image>
        <el-icon :size="64" color="#c0c4cc">
          <Icon :icon="icon" v-if="icon" />
        </el-icon>
      </template>
      <el-button v-if="actionText" type="primary" @click="emit('action')">
        {{ actionText }}
      </el-button>
    </el-empty>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  padding: 48px 0;
}
</style>
