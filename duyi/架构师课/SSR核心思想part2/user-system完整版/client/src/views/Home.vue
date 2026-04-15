<template>
  <div class="container">
    <Alert v-if="alert" v-bind="alert" @close="closeAlert" />
    <div class="top">
      <el-input
        class="searchBox"
        v-model="searchItem"
        placeholder="搜索"
        @input="changeHandle"
        clearable
      />
      <el-button type="primary" :icon="Plus" size="small" @click="goToAddUser">添加用户</el-button>
    </div>

    <!-- 表格 -->
    <!-- <el-table :data="list" stripe style="width: 100%">
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="age" label="年龄" width="180" align="center" />
      <el-table-column prop="phone" label="联系方式" align="center" />
      <el-table-column prop="" label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="goToDetail(scope.row)"
            >详情</el-button
          >
        </template>
      </el-table-column>
    </el-table> -->

    <table class="table-container">
      <thead>
        <tr>
          <th>姓名</th>
          <th>年龄</th>
          <th>联系方式</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in list" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.age }}</td>
          <td>{{ item.phone }}</td>
          <td>
            <el-button type="primary" size="small" @click="goToDetail(item)">详情</el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import Alert from '../components/Alert.vue'
import { useServerData } from '@/hooks'
import { useUserStore } from '@/store'
const store = useUserStore()

// 所用的用户数据，从仓库里面去拿
const userList = computed(() => store.getUserList)
const searchItem = ref('') // 存储用户输入的搜索信息
const alert = ref(null)
const searchList = ref([]) // 存储搜索后的数据

const route = useRoute()
const router = useRouter()

await useServerData(async () => {
  await store.fetchUser()
})

// 获取用户列表数据
onMounted(async () => {
  if (store.getUserList.length === 0) {
    await store.fetchUser()
  }
})

// 获取跳转到 Home 组件时传递的 state 数据
onMounted(() => {
  if (route.query.alert) {
    alert.value = route.query
  }
})

function changeHandle() {
  const name = searchItem.value
  const arr = userList.value.filter((item) => item.name.match(name))
  searchList.value = arr
}

function closeAlert() {
  alert.value = null
}

function goToDetail(item) {
  router.push(`/detail/${item.id}`)
}

function goToAddUser() {
  router.push('/add')
}

// list 就是最终要显示的列表
const list = computed(() => (searchItem.value ? searchList.value : userList.value))
</script>

<style scoped>
.title {
  margin-bottom: 20px;
  font-weight: 200;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}
.searchBox {
  width: 400px;
}

/* 添加必要的样式调整 */
.el-header {
  background-color: #333;
  color: white;
  line-height: 60px;
}
.el-menu-demo {
  background-color: transparent;
}

/* 表格外层容器样式 */
.table-container {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
}

/* 表格样式 */
.table-container table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  background-color: #fff;
}

/* 表头样式 */
.table-container thead {
  background-color: #f5f7fa;
}

.table-container th {
  padding: 12px 16px;
  font-weight: 400;
  font-size: 14px;
  color: #909399;
  border-bottom: 1px solid #ebeef5;
}

/* 表格行样式 */
.table-container tbody tr:hover {
  background-color: #f5f7fa;
}

.table-container td {
  padding: 12px 16px;
  font-size: 14px;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
}

/* 表格行奇偶行样式 */
.table-container tbody tr:nth-child(odd) {
  background-color: #fff;
}

.table-container tbody tr:nth-child(even) {
  background-color: #fafafa;
}
</style>
