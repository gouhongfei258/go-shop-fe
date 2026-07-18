import { ref, computed } from 'vue'

export function usePagination(defaultTake = 20) {
  const skip = ref(0)
  const take = ref(defaultTake)
  const total = ref(0)

  const currentPage = computed(() => Math.floor(skip.value / take.value) + 1)
  const pageCount = computed(() => Math.ceil(total.value / take.value) || 1)

  function handlePageChange(page: number) {
    skip.value = (page - 1) * take.value
  }

  function handleSizeChange(size: number) {
    take.value = size
    skip.value = 0
  }

  function reset() {
    skip.value = 0
    take.value = defaultTake
    total.value = 0
  }

  return {
    skip,
    take,
    total,
    currentPage,
    pageCount,
    handlePageChange,
    handleSizeChange,
    reset,
  }
}
