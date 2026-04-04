# React与Vue3渲染流程完整对比笔记

> 本文档详细梳理React与Vue3的渲染流程节点，并从多维度进行对比分析。

---

## 目录

- [一、React渲染流程](#一react渲染流程)
- [二、Vue3渲染流程](#二vue3渲染流程)
- [三、流程对比总览](#三流程对比总览)
- [四、核心差异对比](#四核心差异对比)
- [五、总结](#五总结)

---

## 一、React渲染流程

### 阶段1：初始化阶段

**核心任务**：创建根Fiber节点 + 生成初始虚拟DOM树

```
createRoot(container)
  ↓
创建根Fiber节点（代表整个应用的根）
  ↓
创建根容器（FiberRootNode）
  ↓
建立Fiber与FiberRoot的连接
  ↓
调用根组件的render方法
  ↓
创建初始虚拟DOM树
```

**关键节点**：
- `createRoot()`：创建并发根节点
- `FiberRootNode`：应用容器，管理整个应用
- `HostRootFiber`：根Fiber节点
- 执行`ReactDOM.render`或`root.render()`

---

### 阶段2：调度阶段（Scheduler）

**核心任务**：调度更新 + 优先级排序

```
触发更新（setState/forceUpdate/props变化）
  ↓
创建更新对象（Update）
  ↓
将更新加入Fiber的更新队列
  ↓
调度器接收更新任务
  ↓
检查是否有高优先级任务
  ↓
根据优先级分配lane
  ↓
加入对应优先级的任务队列
  ↓
请求调度（requestIdleCallback或MessageChannel）
```

**Lane优先级模型**：
```javascript
// 优先级从高到低
SyncLane          // 同步优先级（用户输入）
InputContinuousLane // 连续输入（拖拽）
DefaultLane       // 默认优先级
TransitionLane    // 过渡优先级（页面切换）
IdleLane          // 空闲优先级
```

**关键节点**：
- `scheduleUpdateOnFiber()`：调度入口
- `ensureRootIsScheduled()`：确保根节点被调度
- `getNextLane()`：获取下一个最高优先级的lane
- `push()`：将任务加入调度队列

---

### 阶段3：协调阶段（Reconciliation）

**核心任务**：diff比较 + 生成更新标记

```
从任务队列取出任务
  ↓
开始render阶段
  ↓
遍历Fiber树
  ↓
对每个Fiber执行beginWork()
  ↓
比较新旧虚拟DOM（diff算法）
  ↓
标记副作用（EffectTag：Placement/Update/Deletion）
  ↓
生成workInProgress树
  ↓
完成completeWork()
  ↓
收集副作用链（EffectList）
```

**Diff算法流程**：
```
1. 单节点对比
   - key相同且type相同 → 复用
   - key不同 → 删除旧的，创建新的
   - key相同但type不同 → 删除旧的，创建新的

2. 多节点对比（三层遍历）
   - 第一轮：从头对比，遇到不匹配停止
   - 第二轮：从尾对比，遇到不匹配停止
   - 第三轮：处理剩余节点（移动/新增/删除）
```

**关键节点**：
- `performUnitOfWork()`：执行工作单元
- `beginWork()`：开始处理Fiber
- `reconcileChildren()`：协调子节点
- `completeWork()`：完成Fiber处理
- `createWorkInProgress()`：创建workInProgress树

---

### 阶段4：生命周期阶段

**核心任务**：调用生命周期钩子

**类组件生命周期**：
```javascript
// 挂载阶段
constructor()
static getDerivedStateFromProps()
render()
componentDidMount()

// 更新阶段
static getDerivedStateFromProps()
shouldComponentUpdate()
render()
getSnapshotBeforeUpdate()
componentDidUpdate()

// 卸载阶段
componentWillUnmount()
```

**函数组件生命周期（Hooks）**：
```javascript
// 挂载
useEffect(() => {
  // componentDidMount
  return () => {
    // componentWillUnmount
  }
}, [])

// 更新
useEffect(() => {
  // componentDidUpdate
}, [dependency])

// 布局阶段
useLayoutEffect(() => {
  // DOM更新后同步执行，阻塞绘制
}, [])
```

---

### 阶段5：渲染阶段（Render Phase）

**核心任务**：执行组件函数体 + 执行Hooks

```
判断组件类型
  ↓
函数组件：执行函数体
  ↓
类组件：调用render方法
  ↓
检测Hooks
  ↓
按顺序执行Hooks
  ↓
useState → 返回当前state和setState
  ↓
useEffect → 收集副作用回调
  ↓
useContext → 返回context值
  ↓
useMemo/useCallback → 返回缓存值
  ↓
返回JSX（虚拟DOM）
```

**Hooks执行规则**：
- 只在顶层调用Hooks
- 只在React函数中调用Hooks
- 顺序必须保持一致

**Hooks链表结构**：
```javascript
// Fiber节点上的Hooks链表
fiber.memoizedState → Hook1 → Hook2 → Hook3 → null

// 每个Hook的结构
{
  memoizedState: any,    // 状态值
  baseState: any,        // 初始状态
  queue: UpdateQueue,    // 更新队列
  next: Hook | null      // 下一个Hook
}
```

---

### 阶段6：Commit阶段

**核心任务**：应用到真实DOM + 执行副作用

```
进入Commit阶段
  ↓
beforeMutation阶段
  - 调用getSnapshotBeforeUpdate
  - 调度useEffect
  ↓
mutation阶段
  - 遍历EffectList
  - 执行Placement（插入）
  - 执行Update（更新）
  - 执行Deletion（删除）
  - 操作真实DOM
  ↓
layout阶段
  - 调用componentDidMount
  - 调用componentDidUpdate
  - 执行useLayoutEffect
  - 切换Fiber树（current → workInProgress）
```

**DOM操作类型（EffectTag）**：
```javascript
Placement  = 1 << 0  // 插入
Update     = 1 << 1  // 更新
Deletion   = 1 << 2  // 删除
PlacementAndUpdate = Placement | Update
ChildDeletion = 1 << 3 // 子节点删除
```

**关键节点**：
- `commitRoot()`：Commit入口
- `commitBeforeMutationEffects()`：DOM操作前
- `commitMutationEffects()`：执行DOM操作
- `commitLayoutEffects()`：DOM操作后
- `switchRoot()`：切换Fiber树

---

### 阶段7：批处理机制

**React 18自动批处理**：
```javascript
// React 18: 所有更新自动批处理
function handleClick() {
  setCount(c => c + 1)
  setFlag(f => !f)
  // 只触发一次render
}

// Promise中也会批处理
fetchSomething().then(() => {
  setCount(c => c + 1)
  setFlag(f => !f)
  // 只触发一次render
})

// 使用flushSync强制同步更新
import { flushSync } from 'react-dom'

flushSync(() => {
  setCount(c => c + 1)
})
// DOM立即更新
```

---

### React完整流程图

```
初始化 → 调度 → 协调 → 生命周期 → 渲染 → Hooks执行 → Commit → (循环)
   ↓        ↓        ↓         ↓        ↓        ↓         ↓
创建Fiber  优先级   Diff比较  调用钩子  执行render 更新状态  DOM更新
```

---

## 二、Vue3渲染流程

### 阶段1：初始化阶段

**核心任务**：创建应用实例 + 响应式劫持

```
createApp(App)
  ↓
创建应用上下文（appContext）
  ↓
安装插件（app.use）
  ↓
注册全局组件（app.component）
  ↓
创建根组件实例
  ↓
调用setup()
  ↓
执行响应式转换
  - reactive()
  - ref()
  - computed()
  ↓
创建依赖收集容器
  ↓
创建组件effect
```

**响应式转换实现**：
```javascript
// reactive实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key) // 依赖收集
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      trigger(target, key) // 触发更新
      return Reflect.set(target, key, value, receiver)
    }
  })
}

// ref实现
function ref(value) {
  return {
    _value: value,
    get value() {
      track(this, 'value')
      return this._value
    },
    set value(newValue) {
      this._value = newValue
      trigger(this, 'value')
    }
  }
}
```

**关键节点**：
- `createApp()`：创建应用实例
- `app.mount()`：触发挂载
- `createComponentInstance()`：创建组件实例
- `setupStatefulComponent()`：执行setup
- `reactive()`/`ref()`：响应式转换

---

### 阶段2：编译阶段

**核心任务**：模板 → 渲染函数 + 静态优化

```
模板字符串
  ↓
词法分析（Tokenizer）
  ↓
语法分析（Parser）
  ↓
生成AST（抽象语法树）
  ↓
AST转换（Transform）
  ↓
静态提升（HoistStatic）
  ↓
PatchFlags标记
  ↓
Block收集
  ↓
生成渲染函数代码
```

**编译优化示例**：
```html
<!-- 模板 -->
<div class="container">
  <p>{{ count }}</p>
  <span>静态文本</span>
  <button @click="increment">+1</button>
</div>
```

编译后：
```javascript
// 静态节点提升
const _hoisted_1 = /*#__PURE__*/_createElementVNode(
  "span", null, "静态文本", -1
)

function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", {
    class: "container"
  }, [
    _createElementVNode("p", null, 
      _toDisplayString(_ctx.count), 
      1 /* TEXT */
    ),
    _hoisted_1, // 静态节点直接复用
    _createElementVNode("button", {
      onClick: _cache[0] || (_cache[0] = (...args) => 
        (_ctx.increment && _ctx.increment(...args))
      )
    }, "+1")
  ]))
}
```

**PatchFlags标记说明**：
```javascript
PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,          // 动态class
  STYLE: 4,          // 动态style
  PROPS: 8,          // 动态属性
  FULL_PROPS: 16,    // 有动态key的属性
  HYDRATE_EVENTS: 32, // 有事件监听器
  STABLE_FRAGMENT: 64, // 稳定的fragment
  KEYED_FRAGMENT: 128, // 有key的fragment
  UNKEYED_FRAGMENT: 256, // 无key的fragment
  NEED_PATCH: 512,   // 需要patch
  DYNAMIC_SLOTS: 1024, // 动态插槽
  HOISTED: -1,       // 静态节点
  BAIL: -2           // 退出优化
}
```

**关键节点**：
- `baseParse()`：解析模板
- `transform()`：转换AST
- `hoistStatic()`：静态提升
- `generate()`：生成代码
- `compile()`：完整编译流程

---

### 阶段3：渲染阶段

**核心任务**：执行render → 生成虚拟DOM + 依赖收集

```
执行render(_ctx, _cache)函数
  ↓
读取响应式数据
  ↓
触发Proxy.get拦截
  ↓
调用track()进行依赖收集
  ↓
创建虚拟DOM节点（VNode）
  ↓
标记PatchFlags
  ↓
收集动态子节点到Block
  ↓
返回subTree（虚拟DOM树）
```

**VNode结构**：
```javascript
const vnode = {
  type: 'div',              // 节点类型
  props: {                  // 属性
    class: 'container',
    onClick: handler
  },
  children: [               // 子节点
    { type: 'p', children: 'text', patchFlag: 1 }
  ],
  patchFlag: 0,             // 动态标记
  dynamicChildren: [        // 动态子节点（Block优化）
    { type: 'p', patchFlag: 1 }
  ],
  shapeFlag: 17,            // 形状标记
  el: null,                 // 真实DOM引用
  key: null,                // key
  ref: null,                // ref
  component: null           // 组件实例
}
```

**关键节点**：
- `renderComponentRoot()`：渲染组件根节点
- `component.render()`：执行render函数
- `createVNode()`：创建虚拟DOM节点
- `_openBlock()`：开启Block
- `_createElementBlock()`：创建Block元素

---

### 阶段4：挂载阶段

**核心任务**：虚拟DOM → 真实DOM

```
判断VNode类型
  ↓
组件类型（Component）
  ↓
mountComponent()
  - 创建组件实例
  - 执行setup
  - 执行render
  ↓
元素类型（Element）
  ↓
mountElement()
  - 创建DOM元素
  - 设置属性/事件
  - 处理子节点
  - 插入到容器
  ↓
文本类型（Text）
  ↓
mountTextNode()
  ↓
保存DOM引用到vnode.el
```

**挂载流程详解**：
```javascript
function mountElement(vnode, container, anchor) {
  // 1. 创建元素
  const el = vnode.el = document.createElement(vnode.type)
  
  // 2. 处理属性
  for (const key in vnode.props) {
    if (key.startsWith('on')) {
      // 事件处理
      el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key])
    } else {
      // 普通属性
      el.setAttribute(key, vnode.props[key])
    }
  }
  
  // 3. 处理子节点
  if (typeof vnode.children === 'string') {
    el.textContent = vnode.children
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => {
      mountElement(child, el)
    })
  }
  
  // 4. 插入容器
  container.insertBefore(el, anchor)
}
```

**关键节点**：
- `processComponent()`：处理组件
- `mountComponent()`：挂载组件
- `processElement()`：处理元素
- `mountElement()`：挂载元素
- `hostInsert()`：插入DOM

---

### 阶段5：依赖收集阶段

**核心任务**：建立 数据 → 组件 的映射关系

```
响应式数据被读取
  ↓
触发Proxy.get拦截
  ↓
调用track(target, key)
  ↓
获取当前活跃的effect
  ↓
创建Dep依赖对象
  ↓
将effect添加到Dep.subs
  ↓
将Dep添加到effect.deps
  ↓
完成双向绑定
```

**依赖收集数据结构**：
```javascript
// 全局依赖映射表
const targetMap = new WeakMap()

// 结构：targetMap = {
//   [target]: Map<{
//     [key]: Dep { subs: Set<ReactiveEffect> }
//   }>
// }

// Dep结构
class Dep {
  constructor() {
    this.subs = new Set() // 订阅者集合
  }
  
  depend() {
    if (activeEffect) {
      this.subs.add(activeEffect)
      activeEffect.deps.add(this)
    }
  }
  
  notify() {
    this.subs.forEach(effect => effect.run())
  }
}

// ReactiveEffect结构
class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn            // 副作用函数
    this.scheduler = scheduler // 调度器
    this.deps = new Set()   // 依赖集合
  }
  
  run() {
    activeEffect = this
    const result = this.fn()
    activeEffect = null
    return result
  }
}
```

**关键节点**：
- `track(target, key)`：依赖收集入口
- `createDep()`：创建Dep对象
- `activeEffect`：当前活跃的副作用
- 双向绑定：`Dep ↔ Effect`

---

### 阶段6：更新触发阶段

**核心任务**：响应式数据变化 → 触发组件更新

```
修改响应式数据
  ↓
触发Proxy.set拦截
  ↓
调用trigger(target, key, value)
  ↓
从targetMap查找该属性的Dep
  ↓
遍历Dep.subs中的所有effect
  ↓
调用effect.scheduler()
  ↓
将effect加入调度队列
  ↓
队列去重
  ↓
加入微任务队列
```

**触发更新实现**：
```javascript
function trigger(target, key, newValue) {
  // 1. 获取依赖映射
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  // 2. 获取该属性的所有依赖
  const dep = depsMap.get(key)
  if (!dep) return
  
  // 3. 触发所有副作用
  const effects = [...dep.subs]
  effects.forEach(effect => {
    // 如果有调度器，使用调度器
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}
```

**关键节点**：
- `trigger()`：触发更新入口
- `targetMap.get()`：查找依赖
- `dep.notify()`：通知所有订阅者
- `effect.scheduler()`：调用调度器

---

### 阶段7：调度阶段

**核心任务**：批量处理更新任务

```
effect.scheduler()被调用
  ↓
queueJob(job)加入队列
  ↓
检查队列是否已包含该job
  ↓
加入队列（去重）
  ↓
触发queueFlush()
  ↓
通过Promise.then加入微任务
  ↓
当前同步代码执行完毕
  ↓
执行flushJobs()
  ↓
按顺序执行所有job
  ↓
清空队列
```

**调度队列实现**：
```javascript
const queue = []
let isFlushing = false
let isFlushPending = false
const resolvedPromise = Promise.resolve()

// 加入队列
function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

// 触发刷新
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    resolvedPromise.then(flushJobs)
  }
}

// 执行队列
function flushJobs() {
  isFlushPending = false
  isFlushing = true
  
  // 按顺序执行
  for (let i = 0; i < queue.length; i++) {
    const job = queue[i]
    job()
  }
  
  queue.length = 0
  isFlushing = false
}
```

**nextTick实现**：
```javascript
function nextTick(fn) {
  return fn ? resolvedPromise.then(fn) : resolvedPromise
}

// 使用
state.count++
state.name = 'new'

await nextTick()
// DOM已更新
```

**关键节点**：
- `queueJob()`：加入任务队列
- `queueFlush()`：触发刷新
- `flushJobs()`：执行任务
- `nextTick()`：等待DOM更新

---

### 阶段8：Diff阶段

**核心任务**：比较新旧虚拟DOM树差异

```
取出新旧subTree
  ↓
判断节点类型
  ↓
类型不同 → 直接替换
  ↓
类型相同 → 进入patch流程
  ↓
检查PatchFlags
  ↓
有PatchFlags → 只更新标记部分
  ↓
无PatchFlags → 全量对比
  ↓
处理子节点
```

**多子节点Diff算法（最长递增子序列）**：
```
旧子节点: [A, B, C, D, E]
新子节点: [A, C, D, B, F]

步骤：
1. 从头对比
   旧[0]=A vs 新[0]=A ✓

2. 从尾对比
   旧[4]=E vs 新[4]=F ✗

3. 建立新节点key → index映射
   { A:0, C:1, D:2, B:3, F:4 }

4. 遍历旧节点，生成位置数组
   旧节点在新节点中的位置：[0, 3, 1, 2, -1]
   (E不存在，标记为-1)

5. 计算最长递增子序列（LIS）
   位置数组：[0, 3, 1, 2, -1]
   LIS = [0, 1, 2] (值：A, C, D)
   LIS索引 = [0, 2, 3]

6. 移动/新增/删除
   - A: 在LIS中，不动
   - B: 不在LIS中，移动到位置3
   - C: 在LIS中，不动
   - D: 在LIS中，不动
   - E: 不存在，删除
   - F: 新增
```

**Diff算法实现**：
```javascript
function patchKeyedChildren(c1, c2, container) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1
  let e2 = l2 - 1
  
  // 1. 从头对比
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = c2[i]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    i++
  }
  
  // 2. 从尾对比
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = c2[e2]
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container)
    } else {
      break
    }
    e1--
    e2--
  }
  
  // 3. 处理剩余节点
  // ...
  
  // 4. 最长递增子序列
  const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
  
  // 5. 移动节点
  // ...
}
```

**关键节点**：
- `patch()`：对比入口
- `patchKeyedChildren()`：有key子节点diff
- `patchUnkeyedChildren()`：无key子节点diff
- `getSequence()`：最长递增子序列算法

---

### 阶段9：Patch阶段

**核心任务**：将差异应用到真实DOM

```
patch(n1, n2, container)
  ↓
判断PatchFlags
  ↓
PatchFlags & TEXT (1)
  → 只更新textContent
  ↓
PatchFlags & CLASS (2)
  → 只更新className
  ↓
PatchFlags & STYLE (4)
  → 只更新style
  ↓
PatchFlags & PROPS (8)
  → 只更新props中变化的属性
  ↓
PatchFlags & FULL_PROPS (16)
  → 全量更新props
  ↓
无PatchFlags
  → 全量对比所有属性
```

**PatchFlags位运算**：
```javascript
// 检查是否包含TEXT标记
if (patchFlag & PatchFlags.TEXT) {
  hostSetElementText(el, newChildren)
}

// 检查是否包含CLASS标记
if (patchFlag & PatchFlags.CLASS) {
  hostPatchProp(el, 'class', null, newProps.class)
}

// 多标记组合
const flag = PatchFlags.TEXT | PatchFlags.CLASS // 3

// 检查
flag & PatchFlags.TEXT  // 1 (真)
flag & PatchFlags.CLASS // 2 (真)
flag & PatchFlags.STYLE // 0 (假)
```

**关键节点**：
- `patchElement()`：元素patch
- `patchProp()`：属性patch
- `patchChildren()`：子节点patch
- 位运算快速判断更新类型

---

### 阶段10：生命周期阶段

**核心任务**：执行生命周期钩子

```javascript
// 挂载阶段
onBeforeMount(() => {
  // DOM挂载前
})

onMounted(() => {
  // DOM挂载后
})

// 更新阶段
onBeforeUpdate(() => {
  // DOM更新前
})

onUpdated(() => {
  // DOM更新后
})

// 卸载阶段
onBeforeUnmount(() => {
  // 组件卸载前
})

onUnmounted(() => {
  // 组件卸载后
})
```

**生命周期钩子注册**：
```javascript
// Vue3生命周期钩子是通过闭包实现的
function onMounted(hook) {
  // 获取当前组件实例
  const instance = currentInstance
  
  if (instance) {
    // 将钩子加入队列
    if (instance.mounted) {
      instance.mounted.push(hook)
    } else {
      instance.mounted = [hook]
    }
  }
}

// 在挂载完成后执行
function mountComponent() {
  // ...挂载逻辑
  
  // 执行onMounted钩子
  if (instance.mounted) {
    instance.mounted.forEach(hook => hook())
  }
}
```

---

### 阶段11：副作用处理

**核心任务**：处理响应式副作用

```javascript
// watchEffect：自动收集依赖
watchEffect(() => {
  console.log(state.count) // 自动追踪count
})

// watch：显式指定依赖
watch(
  () => state.count,
  (newVal, oldVal) => {
    console.log(`count changed: ${oldVal} → ${newVal}`)
  }
)

// watch多个源
watch([() => state.count, () => state.name], ([newCount, newName]) => {
  console.log(newCount, newName)
})
```

**watchEffect选项**：
```javascript
watchEffect(
  (onCleanup) => {
    const timer = setInterval(() => {}, 1000)
    
    // 清理函数
    onCleanup(() => {
      clearInterval(timer)
    })
  },
  {
    flush: 'pre'   // 默认：更新前执行
    flush: 'post'  // 更新后执行（类似useEffect）
    flush: 'sync'  // 同步执行
  }
)
```

---

### Vue3完整流程图

```
初始化 → 编译 → 渲染 → 挂载 → 依赖收集 → 更新触发 → 调度 → Diff → Patch → 提交 → (循环)
   ↓        ↓        ↓        ↓         ↓          ↓        ↓       ↓       ↓       ↓
响应式劫持  模板优化  VNode生成  DOM创建  Dep↔Effect  Proxy.set  队列批处理 LIS算法  位运算优化  生命周期
```

---

## 三、流程对比总览

### 流程节点对比表

| 序号 | 流程节点 | React | Vue3 |
|------|----------|-------|------|
| 1 | **初始化** | 创建根Fiber → 执行render | 创建应用实例 → 响应式劫持 → 初始化依赖容器 |
| 2 | **编译** | JSX → createElement（无优化） | 模板 → AST → 静态提升 → PatchFlags → render函数 |
| 3 | **渲染** | 执行render → 生成虚拟DOM树 | 执行render → 触发get拦截 → 依赖收集 → 生成VNode |
| 4 | **挂载** | 无独立阶段，集成在Commit中 | 递归创建DOM → 设置属性 → 插入容器 |
| 5 | **依赖收集** | 无（运行时无法追踪） | Proxy.get → track → Dep ↔ Effect双向绑定 |
| 6 | **更新触发** | setState → 调度器 | Proxy.set → trigger → 查找Dep → 执行effect |
| 7 | **调度** | Scheduler优先级队列 + lane | jobQueue微任务队列 + 去重 |
| 8 | **协调/Diff** | 双端对比，O(n)复杂度 | 最长递增子序列 + PatchFlags位运算 |
| 9 | **Patch** | 无标记，全量对比属性 | PatchFlags位运算，只更新标记部分 |
| 10 | **Commit提交** | 应用到真实DOM → 切换Fiber树 | 应用到真实DOM → 更新el引用 |
| 11 | **生命周期** | componentDidMount/Update/Unmount | onMounted/Updated/Unmounted |
| 12 | **批量更新** | React18自动批处理 | 永远自动批处理 |
| 13 | **异步控制** | 无内置API | nextTick() 等待DOM更新完成 |

---

## 四、核心差异对比

### 1. 响应式系统

| 维度 | React | Vue3 |
|------|-------|------|
| **数据模型** | 不可变数据（Immutable） | 可变数据（Mutable） |
| **更新检测** | 手动调用setState/useState | Proxy自动拦截 |
| **依赖追踪** | 手动声明useEffect依赖数组 | 自动收集依赖 |
| **粒度** | 组件级（整体重新render） | 属性级（精准触发） |
| **心智模型** | 显式声明依赖 | 隐式自动追踪 |

---

### 2. Diff算法

| 维度 | React | Vue3 |
|------|-------|------|
| **触发时机** | 每次render都diff | 响应式数据变化才diff |
| **对比范围** | 整棵虚拟DOM树 | Block的dynamicChildren数组 |
| **核心算法** | 双端对比 | 最长递增子序列（LIS） |
| **优化手段** | 手动React.memo/useMemo | 编译器自动PatchFlags |
| **key处理** | 用于识别节点，减少创建 | 用于LIS算法，减少移动 |
| **时间复杂度** | O(n) | O(n) |

---

### 3. 更新调度

| 维度 | React | Vue3 |
|------|-------|------|
| **调度器** | Scheduler + lane优先级模型 | jobQueue微任务队列 |
| **可中断** | 支持（Fiber时间切片） | 不支持 |
| **优先级** | 高优先级可打断低优先级 | 无优先级概念，先进先出 |
| **并发模式** | 支持（Concurrent Mode） | 不支持 |
| **适用场景** | 复杂交互、动画 | 普通Web应用 |

---

### 4. 编译时优化

| 维度 | React | Vue3 |
|------|-------|------|
| **编译器** | JSX无优化（运行时） | 模板编译器深度优化 |
| **静态提升** | 无 | 静态节点提升到render外 |
| **动态标记** | 无 | PatchFlags位标记 |
| **Block Tree** | 无 | 动态节点扁平收集 |
| **Tree Shaking** | 不支持 | 按需引入运行时 |
| **优化责任** | 开发者承担 | 编译器承担 |

---

### 5. 生命周期对比

| 阶段 | React | Vue3 | 执行时机 |
|------|-------|------|----------|
| **挂载前** | - | onBeforeMount | DOM创建前 |
| **挂载后** | componentDidMount | onMounted | DOM创建后 |
| **更新前** | - | onBeforeUpdate | DOM更新前 |
| **更新后** | componentDidUpdate | onUpdated | DOM更新后 |
| **卸载前** | - | onBeforeUnmount | 组件卸载前 |
| **卸载后** | componentWillUnmount | onUnmounted | 组件卸载后 |
| **副作用** | useEffect（异步） | watchEffect（同步/异步可选） | 渲染后 |

---

### 6. 批量更新机制

| 维度 | React | Vue3 |
|------|-------|------|
| **批处理时机** | React18开始全量批处理 | 永远自动批处理 |
| **异步环境中** | React18支持 | 始终支持 |
| **强制同步** | flushSync() | 无需（本来就是微任务） |
| **等待更新** | 无内置API | nextTick() |

---

### 7. Hooks vs Composition API

| 维度 | React Hooks | Vue3 Composition API |
|------|-------------|----------------------|
| **状态定义** | useState | ref/reactive |
| **副作用** | useEffect | watchEffect/watch |
| **计算属性** | useMemo | computed |
| **回调缓存** | useCallback | 无需（响应式自动处理） |
| **依赖声明** | 必须手动声明 | 自动收集 |
| **闭包陷阱** | 常见问题 | 无此问题 |
| **执行顺序** | 每次render都执行 | 只在依赖变化时执行 |

---

## 五、总结

### 设计哲学对比

| 维度 | React | Vue3 |
|------|-------|------|
| **核心理念** | UI = f(state) | 响应式数据驱动 |
| **更新策略** | 推式：开发者触发更新 | 拉式：自动追踪依赖 |
| **优化方向** | 运行时调度优化 | 编译时静态优化 |
| **心智负担** | 较高（需理解闭包、依赖） | 较低（响应式自动处理） |

---

### 适用场景

**React适用场景**：
- 复杂交互应用（如编辑器、设计工具）
- 需要细粒度控制渲染优先级
- 深度依赖React生态（React Native、Next.js）
- 团队习惯函数式编程 + 不可变数据

**Vue3适用场景**：
- 传统Web应用（表单、数据展示、后台管理）
- 追求开发效率 + 自动性能优化
- 希望框架承担心智负担
- 团队习惯模板语法 + 响应式思维

---

### 本质差异

```
React = 运行时调度大师
- 通过Fiber架构实现可中断渲染
- 通过优先级调度处理复杂交互
- 优化责任主要在开发者

Vue3 = 编译时优化专家
- 通过Proxy实现精准依赖追踪
- 通过PatchFlags实现靶向更新
- 优化责任主要在编译器
```

---

## 附录：关键概念速查

### React关键术语

| 术语 | 说明 |
|------|------|
| Fiber | React16+的核心架构，支持可中断渲染 |
| workInProgress | 正在构建的Fiber树 |
| EffectTag | 标记DOM操作类型（Placement/Update/Deletion） |
| Lane | 优先级模型，替代expirationTime |
| Scheduler | 调度器，决定何时执行更新 |
| Concurrent Mode | 并发模式，支持可中断渲染 |

### Vue3关键术语

| 术语 | 说明 |
|------|------|
| Proxy | Vue3响应式系统核心 |
| Dep | 依赖收集容器 |
| Effect | 副作用函数 |
| PatchFlags | 动态节点标记 |
| Block | 动态节点容器 |
| LIS | 最长递增子序列算法 |
| targetMap | 全局依赖映射表 |

---

> 文档创建时间：2026年04月04日
> 
> 版本：v1.0
