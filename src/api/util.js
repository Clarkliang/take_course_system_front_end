/**
 * 工具api
 */

import request from '@/utils/request'

export function getShortUuid() {
  return request({
    url: '/shortUuid',
    method: 'get',
  })
}
