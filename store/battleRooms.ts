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
  }),
  createBattleRoom(
    _,
    userInfo: { uid: string; name: string }
  ): Promise<
    firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
  > {
    return this.$firestore.createBattleRoom(userInfo.uid, userInfo.name)
  },
  setBattleId(_, userInfo: { uid: string; battleId: string }) {
    this.$firestore.setBattleId(userInfo.uid, userInfo.battleId)
  },
  deleteBattleRoom(_, battleId: string): Promise<void> {
    return this.$firestore.deleteBattleRoom(battleId)
  }
}
