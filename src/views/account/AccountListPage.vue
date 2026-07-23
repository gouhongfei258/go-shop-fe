<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAccounts, updateAccountRole } from '@/api/accounts'
import { usePagination } from '@/composables/usePagination'
import type { Account } from '@/types'

const accounts = ref<Account[]>([])
const loading = ref(true)
const pagination = usePagination(20)

const roleOptions = [
  { value: 'buyer', label: '买家' },
  { value: 'seller', label: '卖家' },
  { value: 'admin', label: '管理员' },
]

const roleColors: Record<string, 'info' | 'warning' | 'danger' | 'primary' | 'success'> = {
  buyer: 'info',
  seller: 'warning',
  admin: 'danger',
}

const roleLabels: Record<string, string> = {
  buyer: '买家',
  seller: '卖家',
  admin: '管理员',
}

async function fetchAccounts() {
  loading.value = true
  try {
    const res = await getAccounts({ skip: pagination.skip.value, take: pagination.take.value })
    accounts.value = res?.data ?? []
    pagination.total.value = res?.total ?? accounts.value.length
  } catch {
    accounts.value = []
  } finally {
    loading.value = false
  }
}

async function handleChangeRole(account: Account) {
  const targetRole = account.role || 'buyer'
  const currentRole = roleLabels[targetRole] || targetRole
  try {
    await ElMessageBox.confirm(
      `确定将用户「${account.name}」的角色修改为「${currentRole}」？`,
      '修改角色',
      {
        confirmButtonText: '确定修改',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return
  }

  try {
    const res = await updateAccountRole(account.id, targetRole)
    ElMessage.success(`用户「${res.data.name}」角色已更新为「${roleLabels[res.data.role || 'buyer']}」`)
    fetchAccounts()
  } catch {
    // 错误在拦截器中处理
  }
}

onMounted(fetchAccounts)
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">账号管理</h1>

    <div v-if="loading" class="section-card">
      <el-skeleton :count="5" animated>
        <template #template>
          <div style="padding: 12px 0">
            <el-skeleton-item variant="text" style="width: 50%" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="accounts.length === 0" class="section-card flex-center" style="padding: 64px">
      <el-empty description="暂无账号" />
    </div>

    <div v-else class="section-card">
      <el-table :data="accounts" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户名" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.role" :type="roleColors[row.role] || 'info'" size="small">
              {{ roleLabels[row.role] || row.role }}
            </el-tag>
            <span v-else class="role-unknown">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-dropdown
              trigger="click"
              @command="(role: string) => handleChangeRole({ id: row.id as number, name: row.name as string, email: row.email as string, role })"
            >
              <el-button size="small">
                修改角色 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="opt in roleOptions"
                    :key="opt.value"
                    :command="opt.value"
                    :disabled="row.role === opt.value"
                  >
                    <span v-if="row.role === opt.value" style="color: #67c23a; margin-right: 4px">✓</span>
                    {{ opt.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
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

<style scoped lang="scss">
.role-unknown {
  color: #c0c4cc;
  font-size: 0.85rem;
}
</style>
