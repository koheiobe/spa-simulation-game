import _ from 'lodash'
import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'
import { ILatlng, WeaponType } from '~/types/battle'

import * as characterService from '~/domain/service/characters'

export const state = (): ICharacterState => ({
  characters: [] as ICharacter[]
})

export const getters: GetterTree<ICharacterState, IRootState> = {
  characterList: (state) => {
    return state.characters
  },
  myCharacterList: (state, getters) => {
    return state.characters.reduce((acum, cur) => {
      if (getters.isMyCharacter(cur as ICharacter)) {
        acum.push(cur)
      }
      return acum
    }, [] as ICharacter[])
  },
  activeCharacter: (_, _1, _2, rootGetters) => {
    return rootGetters['character/activeCharacter/activeCharacter']
  },
  deployCharacterId: (_1, _2, _3, rootGetters) => {
    return rootGetters['character/deploy/deployCharacterId']
  },
  characterAtCell: (state, getters) => (latLng: ILatlng) => {
    return characterService.getCharacterAtCell(
      state.characters,
      getters.activeCharacter,
      latLng
    )
  },
  isMyCharacter: (_1, _2, _3, rootGetters) => (
    character: ICharacter
  ): boolean => {
    return characterService.isMyCharacter(
      character,
      rootGetters['battleRoom/isHostOrGuest']
    )
  }
}

export const mutations: MutationTree<ICharacterState> = {
  setCharacterParam(state, obj) {
    state.characters = state.characters.map((character) =>
      character.id === obj.id ? { ...character, ...obj.value } : character
    )
  }
}

export const actions: ActionTree<ICharacterState, IRootState> = {
  setActiveCharacter({ state, commit }, cellCharacterId: string) {
    const activeCharacter = state.characters.find(
      (character) => cellCharacterId === character.id
    )
    commit('character/activeCharacter/setActiveCharacter', activeCharacter, {
      root: true
    })
  },
  updateActiveCharacter({ commit }, param) {
    commit('character/activeCharacter/updateActiveCharacter', param, {
      root: true
    })
  },
  bindCharactersRef: firestoreAction(
    ({ bindFirestoreRef }, ref): Promise<firebase.firestore.DocumentData[]> => {
      // bindしてからfirestoreではなくvuexの値を更新すると、bindが外れてしまう！
      return bindFirestoreRef('characters', ref)
    }
  ),
  updateCharacter(_, dbInfo: { battleId: string; character: ICharacter }) {
    return this.$firestore.updateCharacter(dbInfo.battleId, dbInfo.character)
  },
  updateCharacters(_, dbInfo: { battleId: string; characters: ICharacter[] }) {
    return this.$firestore.updateCharacters(dbInfo.battleId, dbInfo.characters)
  },
  setCharacterParam(context, obj) {
    return new Promise((resolve) => {
      context.commit('setCharacterParam', {
        id: obj.id,
        value: obj.value
      })
      resolve()
    })
  },
  tryMoveCharacter(
    { getters, commit, dispatch },
    obj: {
      latLng: ILatlng
      cellCharacterId: string
      isMyTurn: boolean
      isHostOrGuest: string
      succeeded: () => void
    }
  ): void {
    if (!getters.isMyCharacter(getters.activeCharacter)) return
    const args = {
      ...obj,
      succeeded: () => {
        commit('field/finishMoveMode', undefined, { root: true })
        obj.succeeded()
      }
    }
    dispatch('character/activeCharacter/tryMoveCharacter', args, { root: true })
  },
  tryPrepareInteractCharacter(
    { commit, getters, dispatch },
    obj: {
      actionType: string
      weaponType: WeaponType
      itemId: number
    }
  ): void {
    dispatch('character/activeCharacter/tryPrepareInteractCharacter', obj, {
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
  async tryInteractCharacter(
    context,
    obj: { cellCharacterId: string; isHostOrGuest: string }
  ): Promise<boolean> {
    if (!context.getters.isMyCharacter(context.getters.activeCharacter))
      return false
    const interactedCharacter = context.state.characters.find(
      (character) => character.id === obj.cellCharacterId
    )
    const isInteracted = await context.dispatch(
      'character/activeCharacter/tryInteractCharacter',
      {
        ...obj,
        interactedCharacter
      },
      { root: true }
    )
    if (!isInteracted) {
      context.dispatch('resetCharacterState')
      return false
    }
    context.dispatch('onFinishAction', obj.isHostOrGuest)
    return true
  },
  async attackCharacter(
    context,
    obj: {
      attackerEl: HTMLElement
      attacker: ICharacter
    }
  ): Promise<boolean> {
    const battleId = context.rootGetters['user/getUser'].battleId
    const takerLatLng = obj.attacker.actionState.interactLatLng
    const taker = context.state.characters.find(
      (character) =>
        character.latLng.x === takerLatLng.x &&
        character.latLng.y === takerLatLng.y
    )
    const attackResultObj = await context.dispatch(
      'character/activeCharacter/attackCharacter',
      {
        ...obj,
        taker
      },
      { root: true }
    )
    if (!attackResultObj) return false
    context.dispatch('updateCharacter', {
      battleId,
      character: _.cloneDeep(attackResultObj.attacker)
    })
    context.dispatch('updateCharacter', {
      battleId,
      character: _.cloneDeep(attackResultObj.taker)
    })
    context.dispatch('battleRoom/setLastInteractCharacter', null, {
      root: true
    })
    return true
  },
  selectCharacter(
    context,
    obj: {
      cellCharacterId: string
      latLng: ILatlng
    }
  ) {
    context.dispatch('setActiveCharacter', obj.cellCharacterId)
    context.commit(
      'field/startMoveMode',
      {
        latLng: obj.latLng,
        character: context.getters.activeCharacter,
        charactersLatLngMap:
          context.rootGetters['character/latLngMap/charactersLatLngMap']
      },
      { root: true }
    )
  },
  onFinishAction(context, isHostOrGuest: string) {
    const battleId = context.rootGetters['user/getUser'].battleId
    context.dispatch('checkWinner', isHostOrGuest)
    context.dispatch(
      'character/activeCharacter/setActiveCharacterStateEnd',
      undefined,
      {
        root: true
      }
    )
    context.dispatch('updateCharacter', {
      battleId,
      character: _.cloneDeep(context.getters.activeCharacter)
    })
    context.dispatch(
      'battleRoom/setLastInteractCharacter',
      _.cloneDeep(context.getters.activeCharacter),
      { root: true }
    )
    context.dispatch('resetCharacterState')
    context.dispatch(
      'character/latLngMap/updateCharactersLatLngMap',
      undefined,
      { root: true }
    )
  },
  checkWinner(context, isHostOrGuest: string) {
    const activeCharacter = context.getters.activeCharacter
    const winnerCell = context.rootGetters['field/winnerCell'](isHostOrGuest)
    if (!activeCharacter) return
    if (
      activeCharacter.latLng.x === winnerCell.x &&
      activeCharacter.latLng.y === winnerCell.y
    ) {
      context.dispatch(
        'battleRoom/setBattleRoomWinner',
        {
          id: context.rootGetters['user/getUser'].battleId,
          winnerUid: context.rootGetters['user/getUser'].uid
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
      isHostOrGuest: string
    }
  ) {
    switch (obj.interacter.actionState.name) {
      case 'attack':
        dispatch('attackCharacter', {
          attackerEl: obj.interacterEl,
          attacker: obj.interacter
        })
    }
    dispatch('character/latLngMap/updateCharactersLatLngMap', undefined, {
      root: true
    })
  },
  resetCharacterState({ commit }) {
    commit('character/activeCharacter/resetActiveCharacter', undefined, {
      root: true
    })
    commit('field/finishInteractMode', undefined, { root: true })
    commit('field/finishMoveMode', undefined, { root: true })
  }
}
