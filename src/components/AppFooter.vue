<template>
  <el-footer class="app-footer">
    <div class="footer-inner">
      <span>&copy; {{ new Date().getFullYear() }} Go Shop. All rights reserved.</span>
    </div>
  </el-footer>
</template>

<style scoped lang="scss">
.app-footer {
  height: 60px !important;
  padding: 0;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
}
</style>
