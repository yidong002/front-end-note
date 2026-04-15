<template>
  <div class="container">
    <el-form
      class="form"
      :model="user"
      id="myForm"
      @submit.prevent="submitStuInfo"
      label-width="100px"
    >
      <div>
        <el-form-item label="姓名">
          <el-input type="text" placeholder="请填写用户姓名" v-model.trim="user.name" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input type="text" placeholder="请填写用户年龄" v-model.trim="user.age" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input type="text" placeholder="请填写用户电话号码" v-model.trim="user.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input type="text" placeholder="请填写用户邮箱地址" v-model.trim="user.email" />
        </el-form-item>
        <el-form-item label="学历">
          <el-select v-model="user.education" placeholder="请选择学历">
            <el-option label="小学" value="小学" />
            <el-option label="初中或职中" value="初中或职中" />
            <el-option label="高中或职高" value="高中或职高" />
            <el-option label="专科" value="专科" />
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
          </el-select>
        </el-form-item>
        <el-form-item label="毕业学校">
          <el-input
            type="text"
            placeholder="请填写用户毕业院校"
            v-model.trim="user.graduationschool"
          />
        </el-form-item>
        <el-form-item label="职业">
          <el-input
            type="text"
            placeholder="请填写用户从事的相关职业"
            v-model.trim="user.profession"
          />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input
            type="textarea"
            rows="10"
            placeholder="请简单的介绍一下你自己，包括兴趣、爱好等信息..."
            v-model.trim="user.profile"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">{{
            id ? '确认修改' : '确认添加'
          }}</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store'
const store = useUserStore()

const router = useRouter()
const route = useRoute()
const id = route.params.id

const user = reactive({
  name: '',
  age: '',
  phone: '',
  email: '',
  education: '本科',
  graduationschool: '',
  profession: '',
  profile: ''
})

onMounted(() => {
  if (id) {
    store.getUserById(id).then(({ data }) => {
      Object.assign(user, data)
    })
  }
})

function submitStuInfo(e) {
  e.preventDefault()

  for (const key in user) {
    if (!user[key]) {
      alert('请完善表单的每一项')
      return
    }
  }

  if (id) {
    store.editUser(id, user)
    router.push({
      path: '/home',
      query: {
        alert: '用户修改成功',
        type: 'info'
      }
    })
  } else {
    store.addUser(user)
    router.push({
      path: '/home',
      query: {
        alert: '用户添加成功！',
        type: 'success'
      }
    })
  }
}
</script>

<style scoped>
.form {
  margin: 20px;
}
</style>
