import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { IUser, RootState } from '~/types/store'

export const state: IUser = {
  name: '',
  battleId: '',
  roomId: '',
  isLogin: false
}

export const getters: GetterTree<IUser, RootState> = {
  getUser: (state) => {
    return state
  }
}

export const mutations: MutationTree<IUser> = {
  setUser(state, user) {
    state.name = user.name
  }
}

export const actions: ActionTree<IUser, RootState> = {
  setUserAsGuest(context) {
    context.commit('setUser', {
      name: 'ゲスト',
      battleId: '',
      roomId: '',
      isLogin: false
    })
  }
}

// export default {
//   namespaced: true,
//   state,
//   mutations,
//   actions,
//   getters
// }

// export const ItemState: Module<UserState, RootState> = {
//   namespaced: true,
//   state,
//   mutations,
//   actions,
//   getters
// }
