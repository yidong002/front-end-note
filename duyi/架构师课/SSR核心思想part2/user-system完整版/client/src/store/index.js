import { defineStore } from 'pinia'
import {
  getUserListApi,
  editUserByIdApi,
  addUserApi,
  deleteUserByIdApi,
  getUserByIdApi
} from '../api/userApi.js'

export const useUserStore = defineStore('userStore', {
  // 定义状态
  state: () => {
    return {
      userList: []
    }
  },
  // 定义 getters
  getters: {
    getUserList: (state) => state.userList
  },
  // 定义修改状态的方法
  actions: {
    // 获取所有用户
    async fetchUser() {
      const res = await getUserListApi()
      this.userList = res.data
    },
    // 根据 id 返回用户信息
    async getUserById(id) {
      return await getUserByIdApi(id)
    },
    // 新增用户
    async addUser(user) {
      await addUserApi(user)
      this.fetchUser()
    },
    // 编辑用户
    async editUser(id, user) {
      await editUserByIdApi(id, user)
      this.fetchUser()
    },
    // 删除用户
    async deleteUser(id) {
      await deleteUserByIdApi(id)
      this.fetchUser()
    }
  }
})
