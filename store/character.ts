import _ from 'lodash'
import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'
import { ILatlng, WeaponType } from '~/types/battle'

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
    state.interactiveCharacter = { ...state.interactiveCharacter, ...param }
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
  // updateActiveCharacter(context, param: any) {
  //   context.commit('updateInteractiveCharacter', {
  //     ...param
  //   })
  // },
  selectDeployTargetCharacter(
    context,
    obj: { id: string; openModal: (id: string) => void }
  ) {
    if (context.state.deployCharacterId === obj.id) {
      context.dispatch('openCharacterModal', obj)
    }
    context.commit('setDeployCharacterId', obj.id)
  },
  onDeployCharacter(
    context,
    obj: {
      latLng: ILatlng
      cellCharacterId: string
    }
  ) {
    // HACK: storeのみを書き換えた結果、vuexfireのrefが外れてしまう。
    // deployモードを終了する時に再度、vuexfireのrefを設定する必要がある
    const updatedLatLng = characterService.getDeployTargetCharacterLatlng(
      obj.cellCharacterId,
      obj.latLng
    )
    context.commit('setCharacterParam', {
      id: characterService.getDeployTargetCharacterId(
        obj.cellCharacterId,
        context.state.deployCharacterId
      ),
      value: {
        latLng: updatedLatLng,
        lastLatLng: updatedLatLng
      }
    })
    context.commit('setDeployCharacterId', '')
  },
  openCharacterModal(
    context,
    obj: { id: string; openModal: (id: string) => void }
  ) {
    context.commit('setInteractiveCharacter', obj.id)
    obj.openModal(obj.id)
  },
  tryMoveCharacter(
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
    context.commit('updateInteractiveCharacter', {
      latLng: obj.latLng,
      lastLatLng: movableCharacter.latLng
    })
    return true
  },
  tryPrepareInteractCharacter(
    context,
    obj: {
      actionType: string
      weaponType: WeaponType
      itemId: number
    }
  ): void {
    if (!context.state.interactiveCharacter) return
    context.commit('updateInteractiveCharacter', {
      actionState: {
        ...context.state.interactiveCharacter.actionState,
        name: obj.actionType,
        itemId: obj.itemId
      }
    })
  },
  tryInteractCharacter(
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
      actionState: {
        ...interactiveCharacter.actionState,
        interactLatLng: targetCharacter.latLng
      }
    })
    return true
  },
  async onAttackCharacter(
    context,
    obj: {
      attackerEl: HTMLElement
      attacker: ICharacter
      battleId: string
    }
  ): Promise<{ attacker: ICharacter; taker: ICharacter } | null> {
    const attackResultObj = await characterService.getUpdatedAttackerAndTaker(
      obj.attackerEl,
      obj.attacker,
      context.state.characters
    )
    if (!attackResultObj) return null
    attackResultObj.attacker.actionState.isEnd = true
    context.dispatch('updateCharacter', {
      battleId: obj.battleId,
      character: _.cloneDeep(attackResultObj.attacker)
    })
    context.dispatch('updateCharacter', {
      battleId: obj.battleId,
      character: _.cloneDeep(attackResultObj.taker)
    })
    return attackResultObj
  },
  onSelectCharacter(context, cellCharacterId) {
    context.commit('setInteractiveCharacter', cellCharacterId)
  },
  setActiveCharacterStateEnd(context) {
    context.commit('updateInteractiveCharacter', {
      actionState: {
        ...context.state.interactiveCharacter?.actionState,
        isEnd: true
      }
    })
  }
}
