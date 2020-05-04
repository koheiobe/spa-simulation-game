import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { IBattleRoom } from '~/types/store'

interface state {
  list: IBattleRoom[]
  battleRoom?: IBattleRoom
}

export const state = (): state => ({
  list: [],
  battleRoom: undefined
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  getBattles: (state) => {
    return state.list
  }
}

export const mutations: MutationTree<RootState> = {}

export const actions: ActionTree<RootState, RootState> = {
  bindBattleRoomsRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    return bindFirestoreRef('list', ref)
  }),
  bindBattleRoomRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    return bindFirestoreRef('battleRoom', ref)
  }),
  createBattleRoom(
    _,
    userInfo: { uid: string; name: string }
  ): Promise<
    firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
  > {
    return this.$firestore.createBattleRoom(userInfo.uid, userInfo.name)
  },
  setUserBattleId(_, userInfo: { uid: string; battleId: string }) {
    this.$firestore.setUserBattleId(userInfo.uid, userInfo.battleId)
  },
  deleteUserBattleId(_, userUid: string | undefined) {
    if (!userUid) return
    this.$firestore.deleteUserBattleId(userUid)
  },
  setBattleRoomGuest(
    _,
    userInfo: { uid: string; name: string; battleId: string }
  ) {
    this.$firestore.setBattleRoomGuest(userInfo)
  },
  setBattleRoomWinner(_, battleRoomInfo: { id: string; winnerUid: string }) {
    this.$firestore.setBattleRoomWinner(battleRoomInfo)
  },
  setTurnUid(_, battleRoomInfo: { id: string; uid: string }) {
    this.$firestore.setTurnUid(battleRoomInfo)
  },
  setOpponentOfflineTimes(
    _,
    battleRoomInfo: {
      id: string
      hostOrGuest: 'host' | 'guest'
      offlineTimes: number
    }
  ) {
    this.$firestore.setOpponentOfflineTimes(battleRoomInfo)
  },
  deleteBattleRoom(_, battleId: string): Promise<void> {
    return this.$firestore.deleteBattleRoom(battleId)
  },
  isBattleRoomExist(_, battleId: string): Promise<boolean> {
    return this.$firestore.isBattleRoomExist(battleId)
  }
}
