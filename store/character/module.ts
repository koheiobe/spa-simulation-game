import { ActionTree, GetterTree } from 'vuex'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'
import { ActionType, IField, ILatlng } from '~/types/battle'
import * as characterService from '~/domain/service/characters'

export const getters: GetterTree<ICharacterState, IRootState> = {
  characterList: (_1, _2, _3, rootGetters): ICharacter[] => {
    return rootGetters['character/character/characterList']
  },
  activeCharacter: (_, _1, _2, rootGetters): ICharacter => {
    return rootGetters['character/activeCharacter/activeCharacter']
  },
  deployCharacterId: (_1, _2, _3, rootGetters): string => {
    return rootGetters['character/deploy/deployCharacterId']
  },
  characterAtCell: (_1, _2, _3, rootGetters) => (
    latLng: ILatlng
  ): ICharacterState | undefined => {
    return rootGetters['character/character/characterAtCell'](latLng)
  },
  isMyCharacter: (_1, _2, _3, rootGetters) => (
    character: ICharacter
  ): boolean => {
    return rootGetters['helper/character/isMyCharacter'](character)
  },
  isHostOrGuest: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['helper/battleRoom/isHostOrGuest']
  },
  isMyTurn: (_1, _2, _3, rootGetters): boolean => {
    return rootGetters['helper/battleRoom/isMyTurn']
  },
  modeType: (_1, _2, _3, rootGetters) => (latLng: ILatlng): boolean => {
    return rootGetters['field/mdoeType'](latLng)
  },
  charactersLatLngMap: (_1, _2, _3, rootGetters) => (): IField => {
    return rootGetters['character/latLngMap/charactersLatLngMap']
  }
}

export const actions: ActionTree<ICharacterState, IRootState> = {
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
  bindCharactersRef({ dispatch }, ref) {
    return dispatch('character/character/bindCharactersRef', ref, {
      root: true
    })
  },
  updateCharacter(
    { dispatch },
    dbInfo: { battleId: string; character: ICharacter }
  ) {
    return dispatch('character/character/updateCharacter', dbInfo, {
      root: true
    })
  },
  updateCharacters(
    { dispatch },
    dbInfo: { battleId: string; character: ICharacter }
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
        dispatch('character/character/selectCharacter', obj, {
          root: true
        })
        // キャラクターが存在しないセルをクリックした場合、すべての行動をキャンセル
      } else {
        dispatch('resetCharacterState')
      }
      return false
    }
  },
  takeBattleAction({ dispatch }, actionType: ActionType) {
    switch (actionType) {
      case 'attack':
        dispatch(
          'character/character/tryPrepareInteractCharacter',
          { actionType, weaponType: 'closeRange', itemId: 0 },
          {
            root: true
          }
        )
        break
      case 'wait':
        dispatch('onFinishAction')
        break
      case 'item':
        dispatch(
          'character/character/tryPrepareInteractCharacter',
          // TODO: item機能を追加する際はitemIdを引数として受け取る
          { actionType, weaponType: 'closeRange', itemId: 0 },
          {
            root: true
          }
        )
        break
      default:
        throw new Error('action type does not exist')
    }
  },
  onFinishAction({ dispatch, getters }) {
    dispatch('character/character/onFinishAction', getters.isHostOrGuest, {
      root: true
    })
  },
  onChangeLastInteractCharacter(
    { dispatch },
    obj: {
      interacterEl: HTMLElement
      interacter: ICharacter
    }
  ) {
    return dispatch(
      'character/character/onChangeLastInteractCharacter',
      { ...obj, isHostOrGuest: getters.isHostOrGuest },
      {
        root: true
      }
    )
  },
  resetCharacterState({ dispatch }) {
    return dispatch('character/character/resetCharacterState', undefined, {
      root: true
    })
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
  }
}
