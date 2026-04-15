// 封装我们的请求函数

import request from './request'

/**
 * 获取学生列表
 * @returns
 */
export function getUserListApi() {
  return request({
    url: '/users',
    method: 'GET'
  })
}

/**
 * 添加学生
 */
export function addUserApi(data) {
  return request({
    url: '/users',
    method: 'POST',
    data
  })
}

// 根据 id 获取学生详细信息
export function getUserByIdApi(id) {
  return request({
    url: `/users/${id}`,
    method: 'GET'
  })
}

// 根据 id 删除学生
export function deleteUserByIdApi(id) {
  return request({
    url: `/users/${id}`,
    method: 'DELETE'
  })
}

// 根据 id 编辑学生
export function editUserByIdApi(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'PATCH',
    data
  })
}
