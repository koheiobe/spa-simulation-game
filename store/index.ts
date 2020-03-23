import { vuexfireMutations } from 'vuexfire'
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { RootState } from './types'
import users from './user'

Vue.use(Vuex)

const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0'
  },
  mutations: {
    ...vuexfireMutations
  },
  modules: {
    users
  }
}

export default new Vuex.Store<RootState>(store)
