import { ActionTree, MutationTree, GetterTree } from 'vuex'
import {
  ICharacter,
  IRootState,
  HostOrGuest,
  IActiveCharacterState
} from '~/types/store'
import { ILatlng, WeaponType, ActionType } from '~/types/battle'

import * as characterService from '~/domain/service/characters'

const initActiveCharacter = {
  name: '',
  maxHp: 0,
  hp: 0,
  attackPoint: 0,
  critical: 0,
  defense: 0,
  luck: 0,
  speed: 0,
  level: 0,
  moveDistance: 0,
  id: '',
  hostOrGuest: '' as HostOrGuest,
  latLng: { x: -1, y: -1 },
  lastLatLng: { x: -1, y: -1 },
  skill: [],
  actionState: {
    name: '' as ActionType,
    itemId: 0,
    isEnd: false,
    interactLatLng: { x: -1, y: -1 }
  }
}

export const state = (): IActiveCharacterState => ({
  activeCharacter: initActiveCharacter
})

export const getters: GetterTree<IActiveCharacterState, IRootState> = {
  activeCharacter: (state) => {
    return state.activeCharacter
  }
}

export const mutations: MutationTree<IActiveCharacterState> = {
  resetActiveCharacter(state) {
    state.activeCharacter = initActiveCharacter
  },
  setActiveCharacter(state, activeCharacter: ICharacter) {
    state.activeCharacter = activeCharacter
  },
  updateActiveCharacter(state, param) {
    state.activeCharacter = { ...state.activeCharacter, ...param }
  }
}

export const actions: ActionTree<IActiveCharacterState, IRootState> = {
  moveCharacter(
    context,
    obj: {
      latLng: ILatlng
      movableCharacter: ICharacter
    }
  ): boolean {
    context.commit('updateActiveCharacter', {
      latLng: obj.latLng,
      lastLatLng: obj.movableCharacter.latLng
    })
    return true
  },
  prepareInteractCharacter(
    context,
    obj: {
      actionType: string
      weaponType: WeaponType
      itemId: number
    }
  ): void {
    context.commit('updateActiveCharacter', {
      actionState: {
        ...context.state.activeCharacter.actionState,
        name: obj.actionType,
        itemId: obj.itemId
      }
    })
  },
  interactCharacter(
    context,
    obj: {
      activeCharacter: ICharacter
      interactedCharacter: ICharacter
    }
  ): boolean {
    context.commit('updateActiveCharacter', {
      actionState: {
        ...obj.activeCharacter.actionState,
        interactLatLng: obj.interactedCharacter.latLng
      }
    })
    return true
  },
  async attackCharacter(
    _,
    obj: {
      attackerEl: HTMLElement
      attacker: ICharacter
      taker: ICharacter
    }
  ): Promise<{ attacker: ICharacter; taker: ICharacter } | undefined> {
    const attackResultObj = await characterService.getUpdatedAttackerAndTaker(
      obj.attackerEl,
      obj.attacker,
      obj.taker
    )
    // if (attackResultObj) {
    // TODO: リファクタリング上、スキルは一旦削除
    // this.skillController.activateSkillOnEndAttack(
    //   attackResultObj.attacker,
    //   attackResultObj.taker,
    //   this.isMyTurn,
    //   (character) =>
    //     this.updateCharacter({
    //       battleId: this.battleId,
    //       character
    //     }),
    //   this.isHostOrGuest
    // )
    // }
    return attackResultObj
  },
  setActiveCharacterStateEnd(context) {
    context.commit('updateActiveCharacter', {
      actionState: {
        ...context.state.activeCharacter?.actionState,
        isEnd: true
      }
    })
  }
}
