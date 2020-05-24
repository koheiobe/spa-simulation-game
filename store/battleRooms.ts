import { ActionTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { IBattleRoomsState, IRootState } from '~/types/store'

export const state = (): IBattleRoomsState => ({
  list: [],
  battleRoom: undefined
})

export const getters: GetterTree<IBattleRoomsState, IRootState> = {
  getBattles: (state) => {
    return state.list
  },
  isHostOrGuest: (state, _, RootState) => {
    if (!state.battleRoom) return ''
    return state.battleRoom.host.uid === RootState.user.loginUser.uid
      ? 'host'
      : 'guest'
  }
}

export const actions: ActionTree<IRootState, IRootState> = {
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
  setTurnInfo(
    _,
    battleRoomInfo: { id: string; uid: string; turnNumber: number }
  ) {
    this.$firestore.setTurnInfo(battleRoomInfo)
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
  }
}
