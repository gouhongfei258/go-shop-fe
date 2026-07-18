import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  )

  const totalCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  function addItem(product: { id: string; name: string; price: number }, quantity = 1) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ ...product, quantity })
    }
  }

  function updateQuantity(id: string, quantity: number) {
    const item = items.value.find((i) => i.id === id)
    if (item) {
      item.quantity = quantity
    }
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, totalPrice, totalCount, addItem, updateQuantity, removeItem, clear }
})
