/**
 * 基础数据
 */

import request from '@/utils/request'

export function getProfessions(params) {
  return request({
    url: '/professions',
    method: 'get',
    params,
  })
}

export function getTitle(params) {
  return request({
    url: '/title',
    method: 'get',
    params,
  })
}

export function postTitle(data) {
  return request({
    url: '/title',
    method: 'post',
    data,
  })
}

export function putTitle(data) {
  return request({
    url: '/title',
    method: 'put',
    data,
  })
}

export function deleteTitle(data) {
  return request({
    url: '/title',
    method: 'delete',
    data,
  })
}

export function getCollege(params) {
  return request({
    url: '/colleges',
    method: 'get',
    params,
  })
}

export function postCollege(data) {
  return request({
    url: '/colleges',
    method: 'post',
    data,
  })
}

export function putCollege(data) {
  return request({
    url: '/colleges',
    method: 'put',
    data,
  })
}

export function deleteCollege(data) {
  return request({
    url: '/colleges',
    method: 'delete',
    data,
  })
}
