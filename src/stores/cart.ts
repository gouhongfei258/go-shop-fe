import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import {
  getCart,
  addCartItem as apiAddCartItem,
  updateCartItemQuantity as apiUpdateQuantity,
  removeCartItem as apiRemoveItem,
  clearCart as apiClearCart,
} from '@/api/cart'
import type { BackendCartItem } from '@/api/cart'

/** 前端购物车条目（扁平化映射后的结构） */
export interface CartItem {
  /** 购物车条目 ID（后端主键，用于更新/删除） */
  cartItemId: number
  /** 商品 ID */
  id: string
  /** 商品名称 */
  name: string
  /** 商品单价 */
  price: number
  /** 数量 */
  quantity: number
}

/** 将后端原始条目映射为前端扁平结构 */
function mapBackendItem(item: BackendCartItem): CartItem {
  return {
    cartItemId: item.id,
    id: item.product_id,
    name: item.product_name,
    price: item.product_price,
    quantity: item.quantity,
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  /** 从后端加载购物车 */
  async function fetchCart() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      items.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const res = await getCart()
      // 后端 GET /api/v1/cart 返回 { data: { items: [...], total_items: N } }
      const rawItems = res?.data?.items
      items.value = Array.isArray(rawItems) ? rawItems.map(mapBackendItem) : []
    } catch (e: any) {
      error.value = e?.response?.data?.error?.message || '获取购物车失败'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  /** 添加商品（异步，写后端） */
  async function addItem(
    product: { id: string; name: string; price: number },
    quantity = 1,
  ) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      // 未登录时本地暂存
      const existing = items.value.find((i) => i.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        items.value.push({ cartItemId: 0, ...product, quantity })
      }
      return
    }

    error.value = null
    try {
      await apiAddCartItem(product.id, quantity)
      // 添加成功后重新获取以保持与后端一致
      await fetchCart()
    } catch (e: any) {
      error.value = e?.response?.data?.error?.message || '添加购物车失败'
      throw e
    }
  }

  /** 更新数量（异步，写后端） */
  async function updateQuantity(productId: string, quantity: number) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      const item = items.value.find((i) => i.id === productId)
      if (item) {
        item.quantity = quantity
      }
      return
    }

    const found = items.value.find((i) => i.id === productId)
    if (!found) return

    error.value = null
    try {
      await apiUpdateQuantity(found.cartItemId, quantity)
      found.quantity = quantity
    } catch (e: any) {
      error.value = e?.response?.data?.error?.message || '更新数量失败'
      throw e
    }
  }

  /** 删除商品（异步，写后端） */
  async function removeItem(productId: string) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      items.value = items.value.filter((i) => i.id !== productId)
      return
    }

    const found = items.value.find((i) => i.id === productId)
    if (!found) return

    error.value = null
    try {
      await apiRemoveItem(found.cartItemId)
      items.value = items.value.filter((i) => i.id !== productId)
    } catch (e: any) {
      error.value = e?.response?.data?.error?.message || '删除购物车商品失败'
      throw e
    }
  }

  /** 清空购物车（异步，写后端） */
  async function clear() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      items.value = []
      return
    }

    error.value = null
    try {
      await apiClearCart()
      items.value = []
    } catch (e: any) {
      error.value = e?.response?.data?.error?.message || '清空购物车失败'
      throw e
    }
  }

  return {
    items,
    loading,
    error,
    totalPrice,
    totalCount,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  }
})
