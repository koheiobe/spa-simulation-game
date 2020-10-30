import _ from 'lodash'
import { ActionTree, GetterTree } from 'vuex'
import { HostOrGuest, ICharacter, IRootState } from '~/types/store'
import { ActionType, IField, ILatlng, WeaponType } from '~/types/battle'
import * as characterService from '~/domain/service/characters'

export const getters: GetterTree<{}, IRootState> = {
  battleRoom: (_1, _2, _3, rootGetters): ICharacter[] => {
    return rootGetters['battleRoom/battleRoom']
  },
  characterList: (_1, _2, _3, rootGetters): ICharacter[] => {
    return rootGetters['character/character/characterList']
  },
  activeCharacter: (_1, _2, _3, rootGetters): ICharacter => {
    return rootGetters['character/activeCharacter/activeCharacter']
  },
  deployCharacterId: (_1, _2, _3, rootGetters): string => {
    return rootGetters['character/deploy/deployCharacterId']
  },
  characterAtCell: (_1, getters) => (
    latLng: ILatlng
  ): ICharacter | undefined => {
    return characterService.getCharacterAtCell(
      getters.characterList,
      getters.activeCharacter,
      latLng
    )
  },
  isMyCharacter: (_1, _2, _3, rootGetters) => (
    character: ICharacter
  ): boolean => {
    return rootGetters['helper/character/isMyCharacter'](character)
  },
  battleId: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['user/getUser'].battleId
  },
  userUid: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['user/getUser'].uid
  },
  isHostOrGuest: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['helper/battleRoom/isHostOrGuest']
  },
  isMyTurn: (_1, _2, _3, rootGetters): HostOrGuest | '' => {
    return rootGetters['helper/battleRoom/isMyTurn']
  },
  isDeployModeEnd: (_1, _2, _3, rootGetters): HostOrGuest | '' => {
    return rootGetters['helper/deploy/isDeployModeEnd']
  },
  modeType: (_1, _2, _3, rootGetters) => (latLng: ILatlng): boolean => {
    return rootGetters['field/modeType'](latLng)
  },
  winnerCell: (_1, getters, _3, rootGetters): ILatlng => {
    return rootGetters['field/winnerCell'](getters.isHostOrGuest)
  },
  charactersLatLngMap: (_1, _2, _3, rootGetters) => (): IField => {
    return rootGetters['character/latLngMap/charactersLatLngMap']
  }
}

export const actions: ActionTree<{}, IRootState> = {
  async onCreatField({ commit, dispatch, getters }) {
    if (!getters.isDeployModeEnd) {
      commit("field/startDeployMode", getters.isHostOrGuest, { root: true })
    }

    if (getters.battleRoom.turn.number === 0) {
      await dispatch('character/character/initCharacters', {
        isMyCharacter: getters.isMyCharacter,
        isHostOrGuest: getters.isHostOrGuest,
        battleId: getters.battleId
      }, {
        root: true
      })
    } else {
      await dispatch('syncVuexFirestoreCharacters')
    }
    dispatch('initCharactersLatLngMap')
  },
  selectDeployTargetCharacter(
    { dispatch },
    obj: { id: string; openModal: (id: string) => void }
  ) {
    return dispatch('character/deploy/selectDeployTargetCharacter', obj, {
      root: true
    })
  },
  deployCharacter(
    { dispatch },
    obj: {
      latLng: ILatlng
      cellCharacterId: string
    }
  ) {
    return dispatch('character/deploy/deployCharacter', obj, {
      root: true
    })
  },
  updateCharacters(
    { dispatch },
    dbInfo: { battleId: string; characters: ICharacter }
  ) {
    return dispatch('character/character/updateCharacters', dbInfo, {
      root: true
    })
  },
  clickCellOnBattle(
    { dispatch, getters, commit },
    obj: {
      latLng: ILatlng
      cellCharacterId: string
      setModal: (b: boolean) => void
    }
  ): boolean {
    const modeType = getters.modeType(obj.latLng)
    if (modeType === 'move') {
      if (!getters.isMyCharacter(getters.activeCharacter)) return false
      const movableCharacter = characterService.getMovableCharacter(
        obj.cellCharacterId,
        getters.isMyTurn,
        getters.activeCharacter
      )
      if (!movableCharacter) return false
      dispatch(
        'character/activeCharacter/moveCharacter',
        {
          latLng: obj.latLng,
          movableCharacter
        },
        { root: true }
      )
      commit('field/finishMoveMode', undefined, { root: true })
      return true
    } else if (modeType === 'interact') {
      const interactedCharacter = getters.characterAtCell(obj.latLng)
      if (
        !interactedCharacter ||
        !getters.isMyCharacter(getters.activeCharacter)
      ) {
        dispatch('resetCharacterState')
        return false
      }
      dispatch(
        'character/activeCharacter/interactCharacter',
        {
          activeCharacter: getters.activeCharacter,
          interactedCharacter
        },
        { root: true }
      )
      dispatch('onFinishAction')
      return false
    } else {
      // キャラクターが存在した場合
      if (obj.cellCharacterId.length > 0) {
        dispatch('selectCharacter', obj)
        // キャラクターが存在しないセルをクリックした場合、すべての行動をキャンセル
      } else {
        dispatch('resetCharacterState')
      }
      return false
    }
  },
  selectCharacter(
    { getters, commit },
    obj: {
      cellCharacterId: string
      latLng: ILatlng
    }
  ) {
    const activeCharacter = getters.characterAtCell(obj.latLng)
    commit('character/activeCharacter/setActiveCharacter', activeCharacter, {
      root: true
    })
    commit(
      'field/startMoveMode',
      {
        latLng: obj.latLng,
        character: activeCharacter,
        charactersLatLngMap: getters.charactersLatLngMap
      },
      { root: true }
    )
  },
  takeBattleAction({ dispatch }, actionType: ActionType) {
    switch (actionType) {
      case 'attack':
        dispatch('prepareInteractCharacter', {
          actionType,
          weaponType: 'closeRange',
          itemId: 0
        })
        break
      case 'wait':
        dispatch('onFinishAction')
        break
      case 'item':
        dispatch(
          'prepareInteractCharacter',
          // TODO: item機能を追加する際はitemIdを引数として受け取る
          { actionType, weaponType: 'closeRange', itemId: 0 }
        )
        break
      default:
        throw new Error('action type does not exist')
    }
  },
  prepareInteractCharacter(
    { commit, getters, dispatch },
    obj: {
      actionType: string
      weaponType: WeaponType
      itemId: number
    }
  ): void {
    dispatch('character/activeCharacter/prepareInteractCharacter', obj, {
      root: true
    })
    commit(
      'field/startInteractMode',
      {
        latLng: getters.activeCharacter.latLng,
        weaponType: obj.weaponType
      },
      { root: true }
    )
  },
  async onFinishAction({ getters, dispatch }) {
    dispatch('checkWinner')
    dispatch(
      'character/activeCharacter/setActiveCharacterStateEnd',
      undefined,
      {
        root: true
      }
    )
    await dispatch('updateCharacterList', _.cloneDeep(getters.activeCharacter))
    dispatch(
      'battleRoom/setLastInteractCharacter',
      _.cloneDeep(getters.activeCharacter),
      { root: true }
    )
    dispatch('resetCharacterState')
  },
  checkWinner({ getters, dispatch }) {
    const activeCharacter = getters.activeCharacter
    const winnerCell = getters.winnerCell
    if (
      activeCharacter.latLng.x === winnerCell.x &&
      activeCharacter.latLng.y === winnerCell.y
    ) {
      dispatch(
        'battleRoom/setBattleRoomWinner',
        {
          id: getters.battleId,
          winnerUid: getters.userUid
        },
        { root: true }
      )
    }
  },
  onChangeLastInteractCharacter(
    { dispatch },
    obj: {
      interacterEl: HTMLElement
      interacter: ICharacter
    }
  ) {
    switch (obj.interacter.actionState.name) {
      case 'attack':
        dispatch('attackCharacter', {
          attackerEl: obj.interacterEl,
          attacker: obj.interacter
        })
    }
    dispatch('character/latLngMap/updateCharactersLatLngMap', obj.interacter, {
      root: true
    })
  },
  async attackCharacter(
    { dispatch, getters },
    obj: {
      attackerEl: HTMLElement
      attacker: ICharacter
    }
  ) {
    const takerLatLng = obj.attacker.actionState.interactLatLng
    const taker = getters.characterList.find(
      (character: ICharacter) =>
        character.latLng.x === takerLatLng.x &&
        character.latLng.y === takerLatLng.y
    )
    const attackResultObj = await dispatch(
      'character/activeCharacter/attackCharacter',
      {
        ...obj,
        taker
      },
      { root: true }
    )
    if (!attackResultObj) return
    dispatch('updateCharacterList', _.cloneDeep(attackResultObj.attacker))
    dispatch('updateCharacterList', _.cloneDeep(attackResultObj.taker))
    dispatch('battleRoom/setLastInteractCharacter', null, {
      root: true
    })
  },
  updateCharacterList({ dispatch, getters }, character: ICharacter) {
    return dispatch(
      'character/character/updateCharacter',
      {
        battleId: getters.battleId,
        character
      },
      { root: true }
    )
  },
  resetCharacterState({ commit }) {
    commit('character/activeCharacter/resetActiveCharacter', undefined, {
      root: true
    })
    commit('field/finishInteractMode', undefined, { root: true })
    commit('field/finishMoveMode', undefined, { root: true })
  },
  initCharactersLatLngMap({ dispatch }) {
    return dispatch('character/latLngMap/initCharactersLatLngMap', undefined, {
      root: true
    })
  },
  updateCharactersLatLngMap({ dispatch }) {
    return dispatch(
      'character/latLngMap/updateCharactersLatLngMap',
      undefined,
      {
        root: true
      }
    )
  },
  syncVuexFirestoreCharacters({ dispatch, getters }) {
    return dispatch('character/character/syncVuexFirestoreCharacters', getters.battleId, {
      root: true
    })
  }
}
