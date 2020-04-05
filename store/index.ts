import { vuexfireMutations, firestoreAction } from 'vuexfire'
import { ActionTree } from 'vuex'
import { IUser, RootState } from '~/types/store'

export const state = () => ({
  version: '1.0.0'
})

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
