<script setup lang="ts">
import type { Product } from '@/types'
import { useRouter } from 'vue-router'

const props = defineProps<{
  product: Product
}>()

const router = useRouter()

function goDetail() {
  router.push({ name: 'ProductDetail', params: { id: props.product.id } })
}
</script>

<template>
  <el-card class="product-card" shadow="hover" @click="goDetail">
    <div class="card-content">
      <div class="product-image">
        <el-icon :size="48" color="#c0c4cc"><Picture /></el-icon>
      </div>
      <div class="product-info">
        <h3 class="product-name">{{ product?.name || product?.id }}</h3>
        <p class="product-desc">{{ product?.description || '' }}</p>
        <div class="product-meta">
          <span class="product-price">&yen;{{ (product?.price ?? 0).toFixed(2) }}</span>
          <el-tag
            v-if="product?.stock"
            :type="
              product.stock.status === 'in_stock'
                ? 'success'
                : product.stock.status === 'low_stock'
                  ? 'warning'
                  : product.stock.status === 'out_of_stock'
                    ? 'danger'
                    : 'info'
            "
            size="small"
          >
            {{ product.stock.display_text }}
          </el-tag>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.product-card {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.card-content {
  display: flex;
  gap: 16px;
}

.product-image {
  width: 120px;
  height: 120px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 0.875rem;
  color: #909399;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f56c6c;
}
</style>
