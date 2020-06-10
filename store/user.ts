import { firestoreAction } from 'vuexfire'
import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { IUserState, IUser, IRootState } from '~/types/store'

export const state = (): IUserState => ({
  loginUser: {
    name: '',
    uid: '',
    battleId: '',
    roomId: '',
    isLogin: false
  } as IUser
})

export const getters: GetterTree<IUserState, IRootState> = {
  getUser: (state) => {
    return state.loginUser
  }
}

export const mutations: MutationTree<IUserState> = {
  setUser(state, loginUser) {
    state.loginUser = loginUser
  },
  setBattleId(state, battleId) {
    state.loginUser.battleId = battleId
  }
}

export const actions: ActionTree<IUserState, IRootState> = {
  setUserRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    // 戦闘画面からhistorybackすることで一時的にstoreUserにnullが
    // 入ってしまうのを防ぐため { reset: false } を設定
    bindFirestoreRef('loginUser', ref, { reset: false })
  }),
  setUserAsGuest(context) {
    const guest = {
      name: 'ゲスト',
      uid: uuidv4(),
      battleId: '',
      roomId: '',
      isLogin: false
    }
    context.commit('setUser', guest)
    return guest
  }
}
