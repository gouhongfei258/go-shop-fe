<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { getProductById, createProduct, updateProduct } from '@/api/products'
import type { ProductInput } from '@/types'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => (isEdit.value ? '编辑商品' : '创建商品'))

const form = reactive<ProductInput>({
  name: '',
  description: '',
  price: 0,
})

const loading = ref(false)
const submitting = ref(false)

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const id = route.params.id as string
      const res = await getProductById(id)
      form.name = res.data.name
      form.description = res.data.description
      form.price = res.data.price
    } catch {
      ElMessage.error('获取商品信息失败')
      router.push({ name: 'ProductList' })
    } finally {
      loading.value = false
    }
  }
})

async function handleSubmit() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入商品名称')
    return
  }
  if (form.name.length > 200) {
    ElMessage.warning('名称最多 200 字符')
    return
  }
  if (!form.description.trim()) {
    ElMessage.warning('请输入商品描述')
    return
  }
  if (form.description.length > 2000) {
    ElMessage.warning('描述最多 2000 字符')
    return
  }
  if (form.price <= 0) {
    ElMessage.warning('价格必须大于 0')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      const id = route.params.id as string
      const res = await updateProduct(id, form)
      ElMessage.success('更新成功')
      router.push({ name: 'ProductDetail', params: { id } })
    } else {
      const res = await createProduct(form)
      ElMessage.success('创建成功')
      router.push({ name: 'ProductDetail', params: { id: res.data.id } })
    }
  } catch {
    // 错误在拦截器中处理
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">{{ pageTitle }}</h1>

    <div v-if="loading" class="section-card flex-center" style="padding: 48px">
      <el-skeleton animated style="width: 100%">
        <template #template>
          <el-skeleton-item variant="text" style="width: 30%" />
          <el-skeleton-item variant="text" />
          <el-skeleton-item variant="text" style="width: 60%" />
          <el-skeleton-item variant="text" />
        </template>
      </el-skeleton>
    </div>

    <div v-else class="section-card" style="max-width: 600px">
      <el-form @submit.prevent="handleSubmit">
        <el-form-item label="商品名称" required>
          <el-input
            v-model="form.name"
            placeholder="最多 200 字符"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="商品描述" required>
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="最多 2000 字符"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="价格" required>
          <el-input-number
            v-model="form.price"
            :min="0.01"
            :precision="2"
            :step="10"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 8px">元</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '创建商品' }}
          </el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
