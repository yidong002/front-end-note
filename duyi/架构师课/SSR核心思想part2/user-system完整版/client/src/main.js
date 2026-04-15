import './assets/main.css'

// import { createApp } from 'vue'
import { createSSRApp } from 'vue'
// 引入了根组件
import App from './App.vue'
// import router from './router'
import { createRouter } from './router'
import { createPinia } from 'pinia'

// 引入组件库
import ElementPlus from 'element-plus'
// 引入组件库相关样式
import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'

// // 挂载根组件
// const app = createApp(App)

// // 引入图标
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }

// const pinia = createPinia()

// app.use(router).use(pinia).use(ElementPlus).mount('#app')

// 不是直接创建应用实例，而是导出一个函数，用于创建应用实例
// 因为在SSR环境下，和纯客户端不一样，服务器只会初始化一次
// 所以为了防止状态污染，每次请求必须是全新的实例
export function createApp() {
  const app = createSSRApp(App)

  const router = createRouter()
  const pinia = createPinia()
  // 引入图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  app.use(router)
  app.use(pinia)
  app.use(ElementPlus)

  // 提供 ID 提供者
  app.provide(ID_INJECTION_KEY, {
    prefix: 1024,
    current: 0
  })
  app.provide(ZINDEX_INJECTION_KEY, { current: 0 })

  return { app, router, pinia }
}
