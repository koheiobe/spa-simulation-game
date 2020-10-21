import { ActionTree, GetterTree } from 'vuex'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'
import { IField, ILatlng, WeaponType } from '~/types/battle'

export const getters: GetterTree<ICharacterState, IRootState> = {
  characterList: (_1, _2, _3, rootGetters): ICharacter[] => {
    return rootGetters['character/character/characterList']
  },
  activeCharacter: (_, _1, _2, rootGetters): ICharacter => {
    return rootGetters['character/character/activeCharacter']
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
    return rootGetters['character/character/isMyCharacter'](character)
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
  setActiveCharacter({ dispatch }, cellCharacterId: string) {
    return dispatch('character/character/setActiveCharacter', cellCharacterId, {
      root: true
    })
  },
  updateActiveCharacter({ dispatch }, param) {
    return dispatch('character/character/updateActiveCharacter', param, {
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
  setCharacterParam({ dispatch }, obj: { id: string; value: any }) {
    return dispatch('character/character/setCharacterParam', obj, {
      root: true
    })
  },
  tryMoveCharacter(
    { dispatch },
    obj: {
      latLng: ILatlng
      cellCharacterId: string
      isMyTurn: boolean
      isHostOrGuest: string
      succeeded: () => void
    }
  ) {
    return dispatch('character/character/tryMoveCharacter', obj, { root: true })
  },
  tryPrepareInteractCharacter(
    { dispatch },
    obj: {
      actionType: string
      weaponType: WeaponType
      itemId: number
    }
  ) {
    return dispatch('character/character/tryPrepareInteractCharacter', obj, {
      root: true
    })
  },
  tryInteractCharacter(
    { dispatch },
    obj: { cellCharacterId: string; isHostOrGuest: string }
  ): Promise<boolean> {
    return dispatch('character/character/tryInteractCharacter', obj, {
      root: true
    })
  },
  attackCharacter(
    { dispatch },
    obj: {
      attackerEl: HTMLElement
      attacker: ICharacter
    }
  ): Promise<boolean> {
    return dispatch('character/character/attackCharacter', obj, {
      root: true
    })
  },
  selectCharacter(
    { dispatch },
    obj: {
      cellCharacterId: string
      latLng: ILatlng
    }
  ) {
    return dispatch('character/character/selectCharacter', obj, {
      root: true
    })
  },
  onFinishAction({ dispatch }, isHostOrGuest: string) {
    return dispatch('character/character/onFinishAction', isHostOrGuest, {
      root: true
    })
  },
  onChangeLastInteractCharacter(
    { dispatch },
    obj: {
      interacterEl: HTMLElement
      interacter: ICharacter
      isHostOrGuest: string
    }
  ) {
    return dispatch('character/character/onChangeLastInteractCharacter', obj, {
      root: true
    })
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
