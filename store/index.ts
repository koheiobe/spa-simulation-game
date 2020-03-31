import { vuexfireMutations, firestoreAction } from 'vuexfire'
import { ActionTree } from 'vuex'
import { IUser, RootState } from '~/types/store'
// import Vue from 'vue'
// import Vuex, { StoreOptions } from 'vuex'
// import { RootState } from './types'
// import users from './user'

// Vue.use(Vuex)

// const store: StoreOptions<RootState> = {
//   state: {
//     version: '1.0.0'
//   },
//   mutations: {
//     ...vuexfireMutations
//   },
//   modules: {
//     users
//   }
// }

// export default new Vuex.Store<RootState>(store)

export const state = {
  version: '1.0.0'
}

export const mutations = {
  ...vuexfireMutations
}

const vuexfireUserActions: ActionTree<IUser, RootState> = {
  setUserRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    bindFirestoreRef('user', ref)
  })
}

export const actions = {
  ...vuexfireUserActions
}
