import _ from 'lodash'
import { ActionTree, GetterTree } from 'vuex'
import { HostOrGuest, ICharacter, IRootState } from '~/types/store'

export const getters: GetterTree<{}, IRootState> = {
  isDeploying: (_1, _2, _3, rootGetters) => {
    return rootGetters["field/isDeploying"]
  },
  isDeployModeEnd: (_1, _2, _3, rootGetters) => {
    return rootGetters["helper/deploy/isDeployModeEnd"]
  },
  isHostAndGuestDeployModeEnd: (_1, _2, _3, rootGetters) => {
    return rootGetters["helper/deploy/isHostAndGuestDeployModeEnd"]
  },
  isMyCharacter: (_1, _2, _3, rootGetters) => (
    character: ICharacter
  ): boolean => {
    return rootGetters['helper/character/isMyCharacter'](character)
  },
  battleRoom: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['battleRoom/battleRoom']
  },
  battleId: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['user/getUser'].battleId
  },
  isHostOrGuest: (_1, _2, _3, rootGetters): HostOrGuest | '' => {
    return rootGetters['helper/battleRoom/isHostOrGuest']
  },
  isMyTurn: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['helper/battleRoom/isMyTurn']
  },
  isBattleRoomUser: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['helper/battleRoom/isBattleRoomUser']
  },
  turnUid: (_1, getters): string => {
    return getters.battleRoom ? getters.battleRoom.turn.uid : ""
  },
  turnNumber: (_1, getters): number => {
    return getters.battleRoom ? getters.battleRoom.turn.number : 0
  },
  userUid: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['user/getUser'].uid
  },
  winnerUid: (_1, getters): string => {
    return getters.battleRoom ? getters.battleRoom.winnerUid : ""
  },
  lastInteractCharacter: (_1, getters): string => {
    return getters.battleRoom ? getters.battleRoom.lastInteractCharacter : undefined
  },
  winnerName: (_1, getters): boolean => {
    const battleRoom = getters.battleRoom
    if (!battleRoom) return false
    return battleRoom.host.uid === battleRoom.winnerUid
      ? battleRoom.host.name
      : battleRoom.guest.name
  },
}

export const actions: ActionTree<{}, IRootState> = {
  async finishDeployMode({ getters, dispatch, commit }) {
    if (!getters.isDeploying) return
    commit("field/finishDeployMode", undefined, { root: true })
    await dispatch("character/character/initMyCharacter", { battleId: getters.battleId, isMyCharacter: getters.isMyCharacter }, { root: true })
    dispatch("character/character/syncVuexFirestoreCharacters", getters.battleId, { root: true })
    dispatch('character/latLngMap/initCharactersLatLngMap', undefined, { root: true })
    dispatch("battleRoom/setDeployModeEnd", {
      id: getters.battleId,
      hostOrGuest: getters.isHostOrGuest,
      bool: true
    }, { root: true })
  },
  startBattle({ dispatch, getters }) {
    const turnNumber = getters.turnNumber
    dispatch("battleRoom/setTurnInfo", {
      id: getters.battleId,
      uid: getters.userUid,
      turnNumber: turnNumber === 0 ? 1 : turnNumber
    }, { root: true })
  },
  changeTurn({ dispatch, getters }, turnUid: string) {
    if (turnUid === '' || !getters.isMyTurn) return
    dispatch("onTurnStart")
  },
  onTurnStart({ dispatch, getters }) {
    dispatch("character/character/initCharactersActionState", getters.battleId, { root: true })
    dispatch('character/latLngMap/initCharactersLatLngMap', undefined, { root: true })
  },
  onTurnEnd({ getters, dispatch }) {
    const battleRoom = getters.battleRoom
    if (!battleRoom) return
    const nextTurnUid =
      battleRoom.turn.uid === battleRoom.host.uid
        ? battleRoom.guest.uid
        : battleRoom.host.uid
    const nextTurnNumber = battleRoom.turn.number + 1
    dispatch("battleRoom/setTurnInfo", {
      id: getters.battleId,
      uid: nextTurnUid,
      turnNumber: nextTurnNumber
    }, { root: true })
  },
  onWin({ dispatch, getters }) {
    dispatch("battleRoom/setBattleRoomWinner", {
      id: getters.battleId,
      winnerUid: getters.userUid
    }, { root: true })
  },
  onSurrender({ getters, dispatch }) {
    const battleRoom = getters.battleRoom
    const opponentUid =
      battleRoom.host.uid === getters.userUid
        ? battleRoom.guest.uid
        : battleRoom.host.uid
    dispatch("battleRoom/setBattleRoomWinner", {
      id: getters.battleId,
      winnerUid: opponentUid
    }, { root: true })
  },
  async beforeLeaveBattleRoom({ dispatch, getters }) {
    await dispatch("battleRoom/unbindBattleRoomRef", undefined, { root: true })
    dispatch("battleRoom/deleteBattleRoom",
      getters.battleId,
      // TODO: エラーハンドリングはあとで考える
      { root: true }).catch(e => console.error('battleRoomの削除に失敗しました。', e))

    dispatch("battleRoom/deleteUserBattleId", getters.userUid, { root: true })
  },
  toggleDeployMode({ dispatch }) {
    dispatch("helper/battleRoom/toggleDeployMode", undefined, { root: true })
  },

}
