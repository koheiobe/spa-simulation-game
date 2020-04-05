import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { IBattleRoom, RootState } from '~/types/store'

interface state {
  list: IBattleRoom[]
}

export const state = () => ({
  list: []
})

export const getters: GetterTree<state, RootState> = {
  getBattles: (state) => {
    return state.list
  }
}

export const mutations: MutationTree<state> = {}

export const actions: ActionTree<state, RootState> = {
  setBattleRoomsRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    bindFirestoreRef('list', ref)
  })
}
