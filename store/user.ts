import { firestoreAction } from 'vuexfire'
import { MutationTree, GetterTree, ActionTree } from 'vuex'
// import { Module } from 'vuex'
import { IUser, RootState } from '@/store/types'

const state: IUser = {
  user: {
    name: '',
    battleId: '',
    roomId: ''
  }
}

const getters: GetterTree<IUser, RootState> = {
  getLoginUser: (state) => {
    return state.user
  }
}

const actions: ActionTree<IUser, RootState> = {
  setUserRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    bindFirestoreRef('user', ref)
  })
}

const mutations: MutationTree<IUser> = {
  setLoginUser(state, loginUser) {
    state.user = { ...loginUser }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

// export const ItemState: Module<IUser, RootState> = {
//   namespaced: true,
//   state,
//   mutations,
//   getters
// }
