import { firestoreAction } from 'vuexfire'
import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { IUser } from '~/types/store'

export const state = () => ({
  loginUser: {} as IUser
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  getUser: (state) => {
    return state.loginUser
  }
}

export const mutations: MutationTree<RootState> = {
  setUser(state, loginUser) {
    state.loginUser = loginUser
  }
}

export const actions: ActionTree<RootState, RootState> = {
  setUserRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    bindFirestoreRef('loginUser', ref)
  }),
  setUserAsGuest(context) {
    context.commit('setUser', {
      name: 'ゲスト',
      uid: '',
      battleId: '',
      roomId: '',
      isLogin: false
    })
  }
}
