import Cookies from 'js-cookie'
// import settings from '@/settings'

const TokenKey = 'student_take_course_system_token'
// const expireHours = settings.tokenExpireHours

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token, options) {
  if (options && options.expireMillisecond) {
    return Cookies.set(TokenKey, token, {
      expires: new Date(Date.now() + options.expireMillisecond),
    })
  } else {
    return Cookies.set(TokenKey, token)
  }
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
