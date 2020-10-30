import { GetterTree, ActionTree } from 'vuex'
import { HostOrGuest, IRootState } from '~/types/store'

export const getters: GetterTree<{}, IRootState> = {
  isHostOrGuest: (_1, _2, _3, rootGetters): HostOrGuest | '' => {
    return rootGetters['battleRoom/battleRoom']
      ? rootGetters['battleRoom/battleRoom'].host.uid ===
        rootGetters['user/getUser'].uid
        ? 'host'
        : 'guest'
      : ''
  },
  isMyTurn: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['battleRoom/battleRoom']
      ? rootGetters['battleRoom/battleRoom'].turn.uid ===
      rootGetters['user/getUser'].uid
      : false
  },
  isBattleRoomUser: (_1, _2, _3, rootGetters): boolean => {
    const battleRoom = rootGetters['battleRoom/battleRoom']
    const userUid = rootGetters['user/getUser'].uid
    return userUid === battleRoom.host.uid ||
      userUid === battleRoom.guest.uid
  },
}

export const actions: ActionTree<{}, IRootState> = {
  toggleDeployMode({ dispatch, rootGetters, getters }) {
    if (rootGetters["helper/deploy/isDeployModeEnd"]) {
      dispatch("field/startDeployMode", getters.isHostOrGuest, { root: true })
      // この機能を使用する場合、components/header/deployの
      // setBattleRoomWinner を削除する必要がある
      dispatch("", getters.isHostOrGuest, { root: true })
      dispatch("battleRoom/setDeployModeEnd", {
        id: rootGetters['user/getUser'].battleId,
        hostOrGuest: getters.isHostOrGuest,
        bool: true
      }, { root: true })
    } else {
      dispatch("field/finishDeployMode", undefined, { root: true })
    }
  }
}

