<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="page-container flex-center" style="min-height: 60vh">
    <el-empty description="页面不存在">
      <el-button type="primary" @click="router.push({ name: 'Home' })">
        返回首页
      </el-button>
    </el-empty>
  </div>
</template>
