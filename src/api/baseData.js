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

export function postProfessions(data) {
  return request({
    url: '/professions',
    method: 'post',
    data,
  })
}

export function putProfessions(data) {
  return request({
    url: '/professions',
    method: 'put',
    data,
  })
}

export function deleteProfessions(data) {
  return request({
    url: '/professions',
    method: 'delete',
    data,
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

export function getAllSchoolYears(params) {
  return request({
    url: '/allSchoolYears',
    method: 'get',
    params,
  })
}

export function postSchoolYear(data) {
  return request({
    url: '/schoolYear',
    method: 'post',
    data,
  })
}

export function putSchoolYear(data) {
  return request({
    url: '/schoolYear',
    method: 'put',
    data,
  })
}

export function deleteSchoolYear(data) {
  return request({
    url: '/schoolYear',
    method: 'delete',
    data,
  })
}

export function getAllTerms(params) {
  return request({
    url: '/allTerms',
    method: 'get',
    params,
  })
}

export function postTerm(data) {
  return request({
    url: '/term',
    method: 'post',
    data,
  })
}

export function putTerm(data) {
  return request({
    url: '/term',
    method: 'put',
    data,
  })
}

export function deleteTerm(data) {
  return request({
    url: '/term',
    method: 'delete',
    data,
  })
}
