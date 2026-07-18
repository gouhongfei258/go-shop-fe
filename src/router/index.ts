import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { setupGuards } from './guards'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

setupGuards(router)

export default router
