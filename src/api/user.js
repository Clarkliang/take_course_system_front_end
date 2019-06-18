import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/loginToken',
    method: 'get',
    params: data,
  })
}

export function getInfo() {
  return request({
    url: '/userInfo',
    method: 'get',
    // params: { token },
  })
}

export function updateUserInfo(values) {
  return request({
    url: '/userInfo',
    method: 'put',
    data: {
      values,
    },
  })
}

/**
 * 修改密码
 */
export function updatePassword(data) {
  return request({
    url: '/password',
    method: 'put',
    data,
  })
}

/**
 * 获取个人登录记录
 */
export function getPersonalLoginRecord(params) {
  return request({
    url: '/personalLoginRecord',
    method: 'get',
    params,
  })
}

/**
 * 获取个人修改密码记录
 * @param {Object} params QS
 */
export function getUpdatePasswordRecords(params) {
  return request({
    url: '/updatePasswordRecords',
    method: 'get',
    params,
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post',
  })
}
