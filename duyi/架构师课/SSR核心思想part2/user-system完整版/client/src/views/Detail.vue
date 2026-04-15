<template>
  <div class="details container">
    <h1 class="page-header">
      {{ user.name }}
      <el-button link type="primary" @click="navigateToHome">返回</el-button>
      <span class="pull-right">
        <el-button @click="navigateToEdit" type="primary" style="margin-right: 10px"
          >修改</el-button
        >
        <el-button @click="dialogVisible = true" type="danger">删除</el-button>
      </span>
    </h1>
    <el-card class="box-card">
      <template v-slot:header>
        <span>用户信息</span>
      </template>
      <ul class="list-group">
        <li class="list-group-item">
          <el-icon class="icon"><Cellphone /></el-icon> 电话：{{ user.phone }}
        </li>
        <li class="list-group-item">
          <el-icon class="icon"><Message /></el-icon> 邮箱：{{ user.email }}
        </li>
      </ul>
    </el-card>
    <el-card class="box-card">
      <template v-slot:header>
        <span>教育与职业</span>
      </template>
      <ul class="list-group">
        <li class="list-group-item">
          <el-icon class="icon"><Reading /></el-icon> 文化水平：{{ user.education }}
        </li>
        <li class="list-group-item">
          <el-icon class="icon"><Collection /></el-icon> 毕业院校：{{ user.graduationschool }}
        </li>
        <li class="list-group-item">
          <el-icon class="icon"><Postcard /></el-icon> 专业：{{ user.profession }}
        </li>
        <li class="list-group-item">
          <el-icon class="icon"><User /></el-icon> 个人简介：{{ user.profile }}
        </li>
      </ul>
    </el-card>
  </div>
  <!-- 删除学生弹出框 -->
  <el-dialog v-model="dialogVisible" title="提示" width="500">
    <span>是否要删除该学生？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteUser"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useServerData } from '@/hooks'
import { useUserStore } from '../store'
const store = useUserStore()

const route = useRoute()
const router = useRouter()
const id = route.params.id

let user = {
  name: '',
  phone: '',
  email: '',
  education: '',
  graduationschool: '',
  profession: '',
  profile: ''
}
if (!import.meta.env.SSR) {
  const { data } = await store.getUserById(id)
  user = data
}

await useServerData(async () => {
  // 这段代码会在服务器环境下执行
  const { data } = await store.getUserById(id)
  Object.assign(user, data)
})

const dialogVisible = ref(false)

const navigateToHome = () => {
  router.push('/home')
}

const navigateToEdit = () => {
  router.push(`/edit/${id}`)
}

const deleteUser = () => {
  store.deleteUser(id)
  dialogVisible.value = true
  router.push({
    path: '/home',
    query: {
      alert: '用户删除成功',
      type: 'success'
    }
  })
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
.icon {
  position: relative;
  top: 2px;
  margin-right: 5px;
}
.pull-right {
  float: right;
}
</style>
