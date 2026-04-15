# SSR架构核心思想解读

>20:30 开始

## 回顾Web应用

1. 静态页面阶段
2. 动态页面阶段
3. 单页应用阶段（SPA、CSR）
4. 服务器端渲染（SSR）

### 1. 静态页面阶段

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2024-12-18-053025.png" alt="image-20241218133025232" style="zoom:50%;" />

### 2. 动态页面阶段

🙋 上一个阶段面临的问题 ？

回答：页面结构相同，只是内容不同（商品的详情页、书籍详情页、新闻详情页）

该阶段重要技术：

1. 模板引擎

   <img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2024-12-18-062215.png" alt="image-20241218142215283" style="zoom:50%;" />

2. 后端动态页面技术

   - JSP
   - PHP
   - ASP
   - Ruby（Ruby on Rails）

3. 流行架构：LAMP

   - Linux
   - Apache
   - MySQL
   - PHP

🙋 前端面临的问题？

回答：不同的后端技术对应不同的模板引擎，哪怕是同一个后端技术，可能模板引擎也不一样

- Java：JSP、Thymeleaf、Velocity、Freemarker
- PHP：Smarty、Twig、HAML、Liquid、Mustache、Plates
- Python：pyTenjin、Tornado.template、PyJade、Mako、Jinja2
- C#：Razor、RazorLight、RazorEngine、Scriban、DotLiquid、Nustache、Handlebars.Net
- Ruby：ERB、Haml、Slim、Liquid、Rabl、Tilt、Mustache
- Node.js：EJS、Pug....

### 3. 单页应用

使用 Ajax 请求数据，然后在客户端操作 DOM 渲染页面。

大胆的想法：整个页面都在客户端来渲染

🙋 面临的问题？

回答：操作DOM非常繁琐（jQuery时代），后面就出现了现代前端框架：

- Angular
- React
- Vue

现代前端框架特点：

1. 由数据驱动视图，开发人员只需要关注数据的变化
2. 组件化开发，复用性更高
3. 前端路由
4. 状态管理库

早期的 [element-ui](https://element.eleme.io/#/zh-CN)，使用的就是 CSR.

🙋面临新的问题？

回答：

1. 首次加载的时候过长，白屏现象`<div id='app'></div>`
2. SEO问题

### 4. 服务器端渲染SSR

很巧妙的一种方式：

1. 服务器端渲染首屏（首屏不等同于首页，首屏指的是用户请求的第一个页面），返回完整的 html
   - index.html（首页）
   - about.html（关于页）
   - contact.html（联系我们）
2. 到达客户端之后，重新变成单页应用

![image-20250109133310661](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2025-01-09-053310.png)

新版的 [element-plus](https://element-plus.org/zh-CN/)，采用的就是 SSR 的方式。

## SSR初体验

1. 渲染Vue应用

   ```js
   import { createSSRApp } from "vue";
   import { renderToString } from "vue/server-renderer";
   
   // 创建一个 vue 的实例
   const app = createSSRApp({
     template: `
       <div>
           <h1>标题</h1>
           <p>{{ message }}</p>
           <button @click="count++">点击{{ count }}</button>
       </div>
     `,
     data: () => ({
       count: 1,
       message: "这是一个SSR的基本示例",
     }),
   });
   
   // 接下来，下一步就是要对 Vue 实例进行渲染
   // 服务器端的渲染，实际上就是把整个 Vue 实例渲染成一个字符串
   const html = await renderToString(app);
   console.log(html);
   
   ```

   - 以前都是在浏览器中使用 Vue，这里是在服务器端使用 Vue
   - 服务端使用 Vue 就是将其渲染为字符串，这个字符串回头是要返回给客户端的

2. 搭建服务器

   ```js
   import { createSSRApp } from "vue";
   import { renderToString } from "vue/server-renderer";
   import express from "express";
   
   // 创建一个 express 的实例
   const server = express();
   
   // 创建一个 vue 的实例
   const app = createSSRApp({
     template: `
         <div>
             <h1>标题</h1>
             <p>{{ message }}</p>
             <button @click="count++">点击{{ count }}</button>
         </div>
       `,
     data: () => ({
       count: 1,
       message: "这是一个SSR的基本示例",
     }),
   });
   
   server.get("/", async (req, res) => {
     try {
       // 接下来，下一步就是要对 Vue 实例进行渲染
       // 服务器端的渲染，实际上就是把整个 Vue 实例渲染成一个字符串
       const html = await renderToString(app);
       res.send(html);
     } catch (err) {
       res.status(500).send("服务器内部错误");
     }
   });
   
   server.listen(3000, () => {
     console.log("Server is running at http://localhost:3000");
   });
   ```

   - 使用的是 express 作为服务器

3. 使用 html 模板

   - html 模板里面要设置占位符
   - 做了内容替换之后，再返回html字符串

4. 客户端水合

   - 没有做水合之前，就是一个干巴巴的html
   - 做水合意味着重新将其变为一个单页应用，能够有交互的功能
   - 服务端渲染出来的结构和客户端水合之后的结构是相同的，这样的代码被称之为“同构代码”
   - 服务器端渲染出来的一次结构，客户端变为单页应用也会渲染出一个结构，并且这两个结构还会进行对比，会看是否一致，如果不一致，会报警告：Hydration completed but mismatch.

## 核心注意点

这些核心注意点，无论是自己搭建SSR项目，还是使用诸如 Nuxt 一类的框架，都是**通用**的注意点。

### 1. 服务器端响应

服务器端是将整个 Vue 应用**渲染为 html 字符串**返回给客户端，然后客户端再做水合操作（Hydration）进行激活（还原为单页应用）。因此服务端的 Vue 应用是没有响应性的，而且也没有必要保留响应性。

因此，为了提高 SSR 的性能和减少不必要的资源消耗，**Vue 默认在服务端渲染期间禁用了响应式转换**。这样，在服务端渲染时，数据**仅作为静态的状态**来使用，**不会再被包裹为响应式对象**，而是直接用于生成最终的静态 HTML 字符串。

举个例子：

```ts
// 这是一个标准的 Vue 应用组件
const app = Vue.createSSRApp({
  data() {
    // 响应式数据
    return { count: 1 }
  },
  template: `<div>{{ count }}</div>`
})
```

在客户端应用中，数据 count 会被转换成响应式对象，Vue 会在内部建立依赖关系，这样如果有交互（例如按钮点击让 count 自增），DOM 就会自动更新。但是在 SSR 时，Vue 只需要读取当前的 count 值，生成静态的 HTML：

```html
<div>1</div>
```

因为在服务端不需要为 count 建立响应式观察，页面渲染完毕后，服务器就不再需要跟踪数据变化了。禁用响应式转换能够省去不必要的计算，并提升渲染性能。

### 2. 组件生命周期钩子

由于服务端渲染只发生一次，且渲染完后不会有数据更新，**<u>也没有真实的 DOM</u>**，因此大部分与“动态交互”或“DOM 操作”相关的生命周期钩子（onMounted 或 onUpdated）**<u>不会</u>**在 SSR 期间被调用，而**只会在客户端运行**。

```vue
<template>
  <div>App页面</div>
</template>

<script setup>
console.log("created"); // 服务器端会执行一次，客户端会执行一次
onMounted(() => {
  // 只会在客户端执行
  console.log("onMounted");
});
</script>
```

🙋在`setup() `或 `<script setup>` （根作用域）中直接写一些副作用代码，例如像 setInterval 这样的定时器逻辑，然后销毁定时器的逻辑放在 `onUnmounted` 里面，会产生什么问题 ？

回答：由于销毁定时器的逻辑在服务器端不会执行，导致服务器端的计时器一直不会被销毁，有内存泄漏的可能性

```vue
<template>
  <div>{{ count }}</div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const count = ref(0)
// 在根作用域下面产生计时器，这段代码是会在服务器端执行的
const timer = setInterval(() => {
  count.value++
  console.log('计时器运行中', count.value)
}, 1000)

// 客户端卸载时清除定时器，这个钩子方法只会在客户端执行
onUnmounted(() => {
  clearInterval(timer)
})
</script>
```

正确的做法：将生成计时器的代码放到生命周期钩子函数

```vue
<template>
  <div>{{ count }}</div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const count = ref(0)
let timer = null;

onMounted(()=>{
  timer = setInterval(() => {
    count.value++
    console.log('计时器运行中', count.value)
  }, 1000)
})

// 客户端卸载时清除定时器，这个钩子方法只会在客户端执行
onUnmounted(() => {
  clearInterval(timer)
})
</script>
```



### 3. 访问平台特有API

SSR 架构下的代码会**执行两次**，**在服务器端执行一次**，**在客户端也会执行一次**。因此我们所书写的代码被称之为**<u>通用</u>**代码，通用代码是不能访问平台特有的 API 的。

```js
if(window.innerWidth > 800){
  // ...
}
```

🙋 那这种特定代码该如何解决呢？

如果是上面的这种情况（访问了浏览器平台特有的API），放到生命周期钩子里面

```js
onMounted(()=>{
  if(window.innerWidth > 800){
    // ...
  }
})
```

还有一些需求，建议使用服务器端和浏览器端的通用库。

例如：fetch请求

```js
fetch('...')
```

取而代之可以使用 node-fetch 这一类的通用库：

- 服务器端：node.js 的 http模块发请求
- 浏览器端：原生fetch发请求

### 4. 跨请求状态污染

先回忆以前创建 Vue 实例的代码：

```js
import { createApp } from 'vue'
// 引入 router 实例
import router from './router'
import { createPinia } from 'pinia'

const pinia = createPinia()

// 创建vue的实例
const app = createApp(App)
// 挂载
app.use(router).use(pinia);
```

以前在客户端这么创建 Vue 实例没什么问题，因为每个客户端都是一个**独立的环境**。

🙋 服务器端这样的代码会存在什么问题？

所有的请求共用一个 Vue 实例。

解决方法：每个请求过来的时候，为整个应用创建一个全新的实例。落地到代码：返回一个函数，调用该函数得到一个新的 Vue 实例

### 5. 激活不匹配

SSR 开发时最常见的问题信息：Hydration completed but contains mismatches

根本原因是客户端在做水合的时候，发现服务器端的 html 结构和客户端水合后的 html 结构不一致。

原因多种多样：

1. 结构不符合预期

```html
<p>
	<div>123</div>
</p>
```

服务器端渲染的时候，不会管你嵌套对不对，直接生成对应的字符串

```js
'<p><div>123</div></p>'
```

在客户端（浏览器端），浏览器在渲染 html 的时候，具备纠错功能

```html
<p></p>
<div>123</div>
<p></p>
```



2. 数据包含随机值

   ```vue
   <div>{{ random() }}</div>
   ```

   服务端执行

   ```vue
   <div>1</div>
   ```

   客户端执行

   ```html
   <div>6</div>
   ```

   

### 6. Teleports

在 SSR 的过程中 `Teleport` 需要**<u>特殊处理</u>**。

🙋为什么需要特殊处理呢？

- Teleports：做传送，将子组件的内容传送到指定 DOM 的地方。
- 特殊处理：生成最终 DOM 的字符串，同样通过占位符的方式进行替换操作。



## 重构CSR项目

1. 改造router
2. 改造入口文件
3. 服务器端渲染
4. 水合操作
5. 解决组件库渲染问题
