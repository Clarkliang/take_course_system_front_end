import axios from 'axios'
import { MessageBox, Notification } from 'element-ui'
import store from '@/store'
// import { getToken, setToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  baseURL: process.env.NODE_ENV === 'production' ? 'http://localhost:3000/' : 'http://localhost:3000/',
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers['X-Token'] = getToken()
      config.headers['X-Token'] = store.getters.token
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    if (res.code === 200) {
      // 判断刷新token
      if (res.refreshToken) {
        const refreshTokenData = res.refreshTokenData
        store.dispatch('user/setToken', refreshTokenData).then(() => {
          store.dispatch('user/getInfo').catch((error) => {
            // 刷新用户信息失败，清空token，重新登录
            Notification({
              message: error.data.errorMessage || '刷新用户信息失败，请重新登录！',
              type: 'error',
              showClose: false,
            })
            store.dispatch('user/resetToken').then(() => {
              location.reload()
            })
          })
        })
      }

      return Promise.resolve(response)
    }

    Notification({
      message: res.errorMessage || 'Error',
      type: 'error',
      showClose: false,
    })

    // 401
    if (res.code === 401) {
      // to re-login
      MessageBox.confirm('由于长时间停留在此页面未作任何操作，您的登录状态已经被取消！<br/>您可选择重新登录或继续停留在此页面', {
        confirmButtonText: '重新登录',
        cancelButtonText: '停留在此页',
        type: 'warning',
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
    }

    // return Promise.reject(new Error(res.errorMessage || 'Error'))
    return Promise.reject(response)
  },
  error => {
    const res = error.response.data
    const httpCode = error.response.status

    console.log('request err: ' + error) // for debug

    // 请求超时
    if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
      Notification({
        message: '请求超时，请重试！',
        type: 'error',
        showClose: false,
      })
    } else if (httpCode === 401) {
      MessageBox.confirm('由于长时间停留在此页面未作任何操作，您的登录状态已经被取消！<br/>您可选择重新登录或继续停留在此页面', {
        confirmButtonText: '重新登录',
        cancelButtonText: '停留在此页',
        type: 'warning',
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
    } else if (httpCode === 403) {
      Notification({
        message: res.errorMessage || '您没有此权限！',
        type: 'error',
        showClose: false,
      })
    }

    return Promise.reject(error.response)
  }
)

export default service
