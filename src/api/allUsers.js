import request from '@/utils/request'

export function getAllStudents(params) {
  return request({
    url: '/allStudents',
    method: 'get',
    params,
  })
}

export function getAllTeachers(params) {
  return request({
    url: '/allTeachers',
    method: 'get',
    params,
  })
}

export function postStudent(data) {
  return request({
    url: '/student',
    method: 'post',
    data,
  })
}

export function postTeacher(data) {
  return request({
    url: '/teacher',
    method: 'post',
    data,
  })
}

export function putAllUsersPassword(data) {
  return request({
    url: '/allUsersPassword',
    method: 'put',
    data,
  })
}
