import { ActionTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { IBattleRoomState, IRootState, ICharacter } from '~/types/store'

export const state = (): IBattleRoomState => ({
  list: [],
  battleRoom: undefined
})

export const getters: GetterTree<IBattleRoomState, IRootState> = {
  getBattles: (state) => {
    return state.list
  }
}

export const actions: ActionTree<IRootState, IRootState> = {
  bindBattleRoomList: firestoreAction(({ bindFirestoreRef }, ref) => {
    return bindFirestoreRef('list', ref)
  }),
  bindBattleRoomRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    return bindFirestoreRef('battleRoom', ref, { reset: false })
  }),
  unBindBattleRoomRef: firestoreAction(({ unbindFirestoreRef }) => {
    // 引数は１つしか受け取れないようになっているが、公式ページなどを確認すると
    // 第二引数が受け取れるようになっているし、実際にうまく動作する。おそらくバグ
    // @ts-ignore
    return unbindFirestoreRef('battleRoom', false)
  }),
  createBattleRoom(
    _,
    userInfo: { uid: string; name: string }
  ): Promise<
    firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
  > {
    return this.$firestore.createBattleRoom(userInfo.uid, userInfo.name)
  },
  async setUserBattleId(
    { commit },
    userInfo: { uid: string; battleId: string }
  ) {
    if (await this.$firestore.isLoginUserExists(userInfo.uid)) {
      return this.$firestore.setUserBattleId(userInfo.uid, userInfo.battleId)
      // firestoreのuserに存在していない場合、ゲストとして参加しているため、vuexにのみデータを保存する
    } else {
      return new Promise((resolve) => {
        resolve(commit('user/setBattleId', userInfo.battleId, { root: true }))
      })
    }
  },
  async deleteUserBattleId({ commit }, userUid: string) {
    if (await this.$firestore.isLoginUserExists(userUid)) {
      this.$firestore.deleteUserBattleId(userUid)
      // firestoreのuserに存在していない場合、ゲストとして参加しているため、vuexにのみデータを保存する
    } else {
      return new Promise((resolve) => {
        resolve(commit('user/setBattleId', '', { root: true }))
      })
    }
  },
  setBattleStartAt(
    _,
    battleInfo: { hostOrGuest: 'host' | 'guest'; id: string }
  ) {
    return this.$firestore.setBattleStartAt(battleInfo)
  },
  setBattleRoomGuest(
    _,
    userInfo: { uid: string; name: string; battleId: string }
  ) {
    return this.$firestore.setBattleRoomGuest(userInfo)
  },
  setDeployModeEnd(
    _,
    battleRoomInfo: {
      id: string
      hostOrGuest: 'host' | 'guest'
      bool: boolean
    }
  ) {
    this.$firestore.setDeployModeEnd(battleRoomInfo)
  },
  setBattleRoomWinner(_, battleRoomInfo: { id: string; winnerUid: string }) {
    this.$firestore.setBattleRoomWinner(battleRoomInfo)
  },
  setLastInteractCharacter(
    _,
    battleRoomInfo: {
      id: string
      lastInteractCharacter: ICharacter | null
    }
  ) {
    return this.$firestore.setLastInteractCharacter(battleRoomInfo)
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
