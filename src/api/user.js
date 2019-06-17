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

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post',
  })
}
