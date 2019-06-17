import Cookies from 'js-cookie'
import settings from '@/settings'

const TokenKey = 'student_take_course_system_token'
const expireHours = settings.tokenExpireHours

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token, { expireMillisecond }) {
  debugger
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
