import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  userInfo: null,
  roles: [],
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response.data
        commit('SET_TOKEN', data.token)
        setToken(data.token, {
          expireMillisecond: data.expires,
        })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (response.status !== 200) {
          reject(data.errorMessage)
        }

        const infoData = data.data
        const { roleInfo } = infoData

        const userInfo = {
          userInfo: infoData.userInfo,
          roleInfo,
        }

        if (roleInfo.id === '43e83795-6f0e-11e9-955c-0242ac110002') {
          userInfo.studentInfo = infoData.studentInfo
        } else if (roleInfo.id === '5a01a43b-6f10-11e9-955c-0242ac110002') {
          userInfo.teacherInfo = infoData.teacherInfo
        }

        if (roleInfo) {
          commit('SET_ROLES', [roleInfo.name])
        }

        commit('SET_USERINFO', userInfo)
        resolve(userInfo)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 设置token
  setToken({ commit }, tokenData) {
    return new Promise((resolve) => {
      const newToken = tokenData.token
      commit('SET_TOKEN', newToken)
      commit('SET_ROLES', [])
      if (tokenData.expireMillisecond) {
        setToken(newToken, {
          expireMillisecond: tokenData.expireMillisecond,
        })
      } else {
        setToken(newToken)
      }
      resolve()
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      // logout(state.token).then(() => {
      commit('SET_TOKEN', '')
      commit('SET_USERINFO', null)
      removeToken()
      resetRouter()
      resolve()
      // }).catch(error => {
      //   reject(error)
      // })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_USERINFO', null)
      removeToken()
      resolve()
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}

