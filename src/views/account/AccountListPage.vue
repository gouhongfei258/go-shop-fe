<script setup lang="ts">
import { getAccounts } from '@/api/accounts'
import { usePagination } from '@/composables/usePagination'
import type { Account } from '@/types'

const accounts = ref<Account[]>([])
const loading = ref(true)
const pagination = usePagination(20)

async function fetchAccounts() {
  loading.value = true
  try {
    const res = await getAccounts({ skip: pagination.skip.value, take: pagination.take.value })
    accounts.value = res.data
    pagination.total.value = res.total ?? accounts.value.length
  } catch {
    accounts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchAccounts)
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">用户列表</h1>

    <div v-if="loading" class="section-card">
      <el-skeleton :count="3" animated>
        <template #template>
          <div style="padding: 12px 0">
            <el-skeleton-item variant="text" style="width: 50%" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="accounts.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="暂无用户" />
    </div>

    <div v-else class="section-card">
      <el-table :data="accounts" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
      </el-table>

      <PaginationBar
        :current-page="pagination.currentPage.value"
        :page-count="pagination.pageCount.value"
        :total="pagination.total.value"
        @update:current-page="(p) => { pagination.handlePageChange(p); fetchAccounts() }"
      />
    </div>
  </div>
</template>
