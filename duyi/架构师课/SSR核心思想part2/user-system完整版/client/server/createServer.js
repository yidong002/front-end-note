import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// 拿到当前文件的目录路径
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 定义 resolve 函数，用于拼接绝对路径
const resolve = (p) => path.resolve(__dirname, '..', p)
export async function createServer() {
  // 创建一个 express 应用
  const app = express()

  // 使用 Vite 创建一个开发服务器
  // 并将其作为中间件（middleware）添加到一个 express 应用中
  const vite = await require('vite').createServer({
    server: {
      middlewareMode: true
    },
    appType: 'custom'
  })
  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl // 拿到请求的 URL
    try {
      // 读取 index.html 文件
      let template = fs.readFileSync(resolve('index.html'), 'utf-8')
      // 该方法用于处理 HTML 模板，注入必要的 Vite 相关资源（如热重载脚本等）。
      template = await vite.transformIndexHtml(url, template)
      // 读取 server-entry.js 拿到 render 方法
      const render = (await vite.ssrLoadModule('/src/entry/server-entry.js')).render
      // 调用 render 方法，得到 HTML 字符串
      const [appHtml, teleports, piniaState] = await render(url)
      // 做模板内容的替换，html文件需要添加<!--ssr-outlet-->
      const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace(/(\n|\r\n)\s*<!--app-teleports-->/, teleports)
        .replace(`<!--pinia-state-->`, piniaState)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (error) {
      // 这是 Vite 提供的方法，用于修复服务器端渲染（SSR）过程中出现的错误堆栈跟踪。
      // SSR 错误堆栈跟踪有时会包含一些无用或混乱的信息，这个方法可以帮助清理这些信息，使其更易于调试。
      vite?.ssrFixStacktrace(error)
      next()
    }
  })

  return { app }
}
