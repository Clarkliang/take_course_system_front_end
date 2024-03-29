/**
 * 课程相关api
 */

import request from '@/utils/request'

export function getAllCourses(params) {
  return request({
    url: '/allCourses',
    method: 'get',
    params,
  })
}

export function postCourse(data) {
  return request({
    url: '/course',
    method: 'post',
    data,
  })
}

export function putCourse(data) {
  return request({
    url: '/course',
    method: 'put',
    data,
  })
}

export function deleteCourse(data) {
  return request({
    url: '/course',
    method: 'delete',
    data,
  })
}

export function getAllTakeCourseEvents(params) {
  return request({
    url: '/allTakeCourseEvents',
    method: 'get',
    params,
  })
}

export function postTakeCourseEvent(data) {
  return request({
    url: '/takeCourseEvent',
    method: 'post',
    data,
  })
}

export function putTakeCourseEvent(data) {
  return request({
    url: '/takeCourseEvent',
    method: 'put',
    data,
  })
}

export function deleteTakeCourseEvent(data) {
  return request({
    url: '/takeCourseEvent',
    method: 'delete',
    data,
  })
}

export function getAllTakeCourseArrangements(params) {
  return request({
    url: '/allTakeCourseArrangements',
    method: 'get',
    params,
  })
}

export function postTakeCourseArrangement(data) {
  return request({
    url: '/takeCourseArrangement',
    method: 'post',
    data,
  })
}

export function putTakeCourseArrangement(data) {
  return request({
    url: '/takeCourseArrangement',
    method: 'put',
    data,
  })
}

export function deleteTakeCourseArrangement(data) {
  return request({
    url: '/takeCourseArrangement',
    method: 'delete',
    data,
  })
}

export function getPersonalTakeCourseRecords(params) {
  return request({
    url: '/personalTakeCourseRecords',
    method: 'get',
    params,
  })
}

export function postPersonalTakeCourseRecords(data) {
  return request({
    url: '/personalTakeCourseRecords',
    method: 'post',
    data,
  })
}

export function putPersonalTakeCourseRecords(data) {
  return request({
    url: '/personalTakeCourseRecords',
    method: 'put',
    data,
  })
}

export function deletePersonalTakeCourseRecords(data) {
  return request({
    url: '/personalTakeCourseRecords',
    method: 'delete',
    data,
  })
}

export function postArrangeCourse(data) {
  return request({
    url: '/arrangeCourse',
    method: 'post',
    data,
  })
}

export function putArrangeCourse(data) {
  return request({
    url: '/arrangeCourse',
    method: 'put',
    data,
  })
}

export function deleteArrangeCourse(data) {
  return request({
    url: '/arrangeCourse',
    method: 'delete',
    data,
  })
}

export function getStudentTakeCourseRecords(params) {
  return request({
    url: '/studentTakeCourseRecords',
    method: 'get',
    params,
  })
}

export function putAllStudentTakeCourseScores(data) {
  return request({
    url: '/allStudentTakeCourseScores',
    method: 'put',
    data,
  })
}
