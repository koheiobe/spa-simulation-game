import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { IBattleRoom } from '~/types/store'

export const state = () => ({
  list: [] as IBattleRoom[]
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  getBattles: (state) => {
    return state.list
  }
}

export const mutations: MutationTree<RootState> = {}

export const actions: ActionTree<RootState, RootState> = {
  setBattleRoomsRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    bindFirestoreRef('list', ref)
  })
}
