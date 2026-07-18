import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '@/types'

/** 商品缓存（可选，用于页面间跳转不丢失数据） */
export const useProductStore = defineStore('product', () => {
  const currentProducts = ref<Product[]>([])
  const currentQuery = ref('')

  function setProducts(products: Product[], query?: string) {
    currentProducts.value = products
    if (query !== undefined) currentQuery.value = query
  }

  function clear() {
    currentProducts.value = []
    currentQuery.value = ''
  }

  return { currentProducts, currentQuery, setProducts, clear }
})
