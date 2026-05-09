import * as mt from "./mutation-type"

const mutations = {
  [mt.IS_LOGIN](state, account) {
    state.isLogin = !!account
    if (state.isLogin) {
      window.sessionStorage.isLogin = 'true'
      return
    }

    state.uid = ''
    state.avatar = ''
    state.permission = ''
    state.name = ''
    window.sessionStorage.removeItem('isLogin')
    window.sessionStorage.removeItem('uid')
    window.sessionStorage.removeItem('avatar')
    window.sessionStorage.removeItem('permission')
    window.sessionStorage.removeItem('name')
  },
  [mt.CHANGE_UID](state, uid) {
    state.uid = uid
    window.sessionStorage.uid = state.uid
  },
  [mt.USER_AVATAR](state, avatar) {
    state.avatar = avatar
    window.sessionStorage.avatar = state.avatar
  },
  [mt.PERMISSION](state, permission) {
    state.permission = permission
    window.sessionStorage.permission = state.permission
  },
  [mt.CHANGE_NAME](state, name) {
    state.name = name
    window.sessionStorage.name = state.name
  }
}

export default mutations
