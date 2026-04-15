<template>
  <!-- 最外层容器 -->
  <div id="app" class="container">
    <!-- 导航栏 -->
    <el-header>
      <el-row>
        <el-col :span="6">
          <div class="logo"></div>
        </el-col>
        <el-col :span="18">
          <el-menu
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
            :default-active="activeIndex"
          >
            <el-menu-item index="home">
              <router-link to="/home" class="navigation">主页</router-link>
            </el-menu-item>
            <el-menu-item index="about">
              <router-link to="/about" class="navigation">关于我们</router-link>
            </el-menu-item>
          </el-menu>
        </el-col>
      </el-row>
    </el-header>
    <!-- 匹配上的路由所对应的组件显示在这个位置 -->
    <div class="content">
      <Suspense>
        <router-view />
      </Suspense>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
// 初始化 activeIndex 为当前路由的名称
const activeIndex = ref(route.matched[0]?.name || 'home')
watch(route, () => {
  activeIndex.value = route.matched[0].name || 'home'
})
const handleSelect = (index) => {
  activeIndex.value = index
}
</script>

<style scoped>
.container {
  width: 1200px;
  padding-top: 20px;
  margin: 0 auto;
}
.navbar-brand {
  font-size: 18px;
  line-height: 60px;
  padding-left: 20px;
}
.navigation {
  text-decoration: none;
  color: inherit;
}
.logo {
  width: 100%;
  height: 60px;
  background: url('./assets/logo.jpg') no-repeat center;
  background-size: 90%;
}
.text-right {
  text-align: right;
  display: flex;
  align-items: center;
}
</style>
