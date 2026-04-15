import { renderToString } from 'vue/server-renderer'
import { createApp } from '../main.js'

function renderTeleports(teleports) {
  if (!teleports) return ''
  return Object.entries(teleports).reduce((all, [key, value]) => {
    if (key.startsWith('#el-popper-container-')) {
      return `${all}<div id="${key.slice(1)}">${value}</div>`
    }
    return all
  }, teleports.body || '')
}

/**
 * @param {*} url 用户请求的url
 */
export async function render(url) {
  const { app, router, pinia } = createApp()

  // 将用户请求的 URL 推送到 Vue 路由器中，触发路由导航。
  router.push(url)
  // 等待路由器完成导航过程，确保所有异步组件和钩子函数都已解析完成。
  await router.isReady()

  const ctx = {}
  // 调用 renderToString 方法，将 Vue 应用实例 app 渲染为 HTML 字符串
  const html = await renderToString(app, ctx)
  const teleports = renderTeleports(ctx.teleports)
  return [html, teleports, JSON.stringify(pinia.state.value)]
}
