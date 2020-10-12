import _ from 'lodash'
import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'
import { ILatlng } from '~/types/battle'

import * as characterService from '~/domain/service/characters'

export const state = (): ICharacterState => ({
  characters: [] as ICharacter[],
  interactiveCharacter: undefined,
  deployCharacterId: ''
})

export const getters: GetterTree<ICharacterState, IRootState> = {
  getActiveCharacter: (state: ICharacterState) => state.interactiveCharacter,
  getDeployCharacterId: (state: ICharacterState) => state.deployCharacterId
}

export const mutations: MutationTree<ICharacterState> = {
  setCharacterParam(state, obj) {
    state.characters = state.characters.map((character) =>
      character.id === obj.id ? { ...character, ...obj.value } : character
    )
  },
  setCharacterList(state, characterList) {
    state.characters = characterList
  },
  resetActiveCharacter(state) {
    state.interactiveCharacter = undefined
  },
  setInteractiveCharacter(state, cellCharacterId: string) {
    state.interactiveCharacter = state.characters.find(
      (character) => cellCharacterId === character.id
    )
  },
  updateInteractiveCharacter(state, param) {
    state.interactiveCharacter = { ...param }
  },
  setDeployCharacterId(state, id) {
    state.deployCharacterId = id
  }
}

export const actions: ActionTree<ICharacterState, IRootState> = {
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
  updateActiveCharacter(context, param: any) {
    context.commit('updateInteractiveCharacter', {
      ...context.state.interactiveCharacter,
      ...param
    })
  },
  selectDeployCharacter(
    context,
    obj: { id: string; openModal: (id: string) => void }
  ) {
    if (context.state.deployCharacterId === obj.id) {
      context.dispatch('openCharacterModal', obj)
    }
    context.commit('setDeployCharacterId', obj.id)
  },
  openCharacterModal(
    context,
    obj: { id: string; openModal: (id: string) => void }
  ) {
    context.commit('setInteractiveCharacter', obj.id)
    obj.openModal(obj.id)
  },
  moveCharacter(
    context,
    obj: {
      latLng: ILatlng
      cellCharacterId: string
      isMyTurn: boolean
      isHostOrGuest: string
    }
  ): boolean {
    const movableCharacter = characterService.getMovableCharacter(
      obj.cellCharacterId,
      obj.isMyTurn,
      obj.isHostOrGuest,
      context.state.interactiveCharacter
    )
    if (!movableCharacter) return false
    context.commit('setInteractiveCharacter', {
      latLng: obj.latLng,
      lastLatLng: movableCharacter.latLng
    })
    return true
  },
  interactCharacter(
    context,
    obj: { cellCharacterId: string; isHostOrGuest: string }
  ): boolean {
    const interactiveCharacter = context.state.interactiveCharacter
    const targetCharacter = characterService.getInteractTargetCharacter(
      obj.cellCharacterId,
      obj.isHostOrGuest,
      interactiveCharacter,
      context.state.characters
    )
    if (!targetCharacter || !interactiveCharacter) return false
    context.commit('updateInteractiveCharacter', {
      ...interactiveCharacter.actionState,
      interactLatLng: targetCharacter.latLng
    })
    return true
  },
  async attackCharacter(
    context,
    obj: {
      attackerEl: HTMLElement
      attacker: ICharacter
      battleId: string
    }
  ): Promise<boolean> {
    const attackResultObj = await characterService.getUpdatedAttackerAndTaker(
      obj.attackerEl,
      obj.attacker,
      context.state.characters
    )
    if (!attackResultObj) return false
    attackResultObj.attacker.actionState.isEnd = true
    context.dispatch('updateCharacter', {
      battleId: obj.battleId,
      character: _.cloneDeep(attackResultObj.attacker)
    })
    context.dispatch('updateCharacter', {
      battleId: obj.battleId,
      character: _.cloneDeep(attackResultObj.taker)
    })
    return true
  },
  onSelectCharacter(context, cellCharacterId) {
    context.commit('setInteractiveCharacter', cellCharacterId)
  }
}
