import _ from 'lodash'
import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'
import { IField, ILatlng, WeaponType } from '~/types/battle'

import * as characterService from '~/domain/service/characters'

export const state = (): ICharacterState => ({
  characters: [] as ICharacter[],
  interactiveCharacter: undefined,
  charactersLatLngMap: {},
  deployCharacterId: ''
})

export const getters: GetterTree<ICharacterState, IRootState> = {
  characterList: (state) => {
    return state.characters
  },
  activeCharacter: (state) => {
    return state.interactiveCharacter
  },
  deployCharacterId: (state) => {
    return state.deployCharacterId
  },
  charactersLatLngMap: (state) => {
    return state.charactersLatLngMap
  },
  characterAtCell: (state) => (latLng: ILatlng) => {
    return characterService.getCharacterAtCell(
      state.characters,
      state.interactiveCharacter,
      latLng
    )
  }
}

export const mutations: MutationTree<ICharacterState> = {
  setCharacterParam(state, obj) {
    state.characters = state.characters.map((character) =>
      character.id === obj.id ? { ...character, ...obj.value } : character
    )
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
  },
  setcharactersLatLngMap(state, charactersLatLngMap: IField) {
    state.charactersLatLngMap = charactersLatLngMap
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
  selectDeployTargetCharacter(
    context,
    obj: { id: string; openModal: (id: string) => void }
  ) {
    if (context.state.deployCharacterId === obj.id) {
      context.dispatch('openCharacterModal', obj)
    }
    context.commit('setDeployCharacterId', obj.id)
  },
  deployCharacter(
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
      succeeded: () => void
    }
  ): void {
    const movableCharacter = characterService.getMovableCharacter(
      obj.cellCharacterId,
      obj.isMyTurn,
      obj.isHostOrGuest,
      context.state.interactiveCharacter
    )
    if (!movableCharacter) return
    context.commit('updateInteractiveCharacter', {
      latLng: obj.latLng,
      lastLatLng: movableCharacter.latLng
    })
    context.commit('field/finishMoveMode', undefined, { root: true })
    obj.succeeded()
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
    context.commit(
      'field/startInteractMode',
      {
        latLng: context.state.interactiveCharacter.latLng,
        weaponType: obj.weaponType
      },
      { root: true }
    )
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
    if (!targetCharacter || !interactiveCharacter) {
      context.dispatch('resetCharacterState')
      return false
    }
    context.commit('updateInteractiveCharacter', {
      actionState: {
        ...interactiveCharacter.actionState,
        interactLatLng: targetCharacter.latLng
      }
    })
    context.dispatch('onFinishAction', obj.isHostOrGuest)
    return true
  },
  async attackCharacter(
    context,
    obj: {
      attackerEl: HTMLElement
      attacker: ICharacter
    }
  ): Promise<void> {
    const battleId = context.rootGetters['user/getUser'].battleId
    const attackResultObj = await characterService.getUpdatedAttackerAndTaker(
      obj.attackerEl,
      obj.attacker,
      context.state.characters
    )
    if (!attackResultObj) return
    context.dispatch('updateCharacter', {
      battleId,
      character: _.cloneDeep(attackResultObj.attacker)
    })
    context.dispatch('updateCharacter', {
      battleId,
      character: _.cloneDeep(attackResultObj.taker)
    })
    //   // TODO: リファクタリング上、スキルは一旦削除
    //   // this.skillController.activateSkillOnEndAttack(
    //   //   attackResultObj.attacker,
    //   //   attackResultObj.taker,
    //   //   this.isMyTurn,
    //   //   (character) =>
    //   //     this.updateCharacter({
    //   //       battleId: this.battleId,
    //   //       character
    //   //     }),
    //   //   this.isHostOrGuest
    //   // )
    context.dispatch('battleRoom/setLastInteractCharacter', null, {
      root: true
    })
  },
  selectCharacter(
    context,
    obj: {
      cellCharacterId: string
      latLng: ILatlng
      charactersLatLngMap: IField
    }
  ) {
    context.commit('setInteractiveCharacter', obj.cellCharacterId)
    if (context.state.interactiveCharacter) {
      context.commit(
        'field/startMoveMode',
        {
          latLng: obj.latLng,
          character: context.state.interactiveCharacter,
          charactersLatLngMap: obj.charactersLatLngMap
        },
        { root: true }
      )
    }
  },
  onFinishAction(context, isHostOrGuest: string) {
    const battleId = context.rootGetters['user/getUser'].battleId
    context.dispatch('checkWinner', isHostOrGuest)
    context.dispatch('setActiveCharacterStateEnd')
    context.dispatch('updateCharacter', {
      battleId,
      character: _.cloneDeep(context.state.interactiveCharacter)
    })
    context.dispatch(
      'battleRoom/setLastInteractCharacter',
      _.cloneDeep(context.state.interactiveCharacter),
      { root: true }
    )
    context.dispatch('resetCharacterState')
    context.dispatch('updateCharactersLatLngMap', isHostOrGuest)
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
  initCharactersLatLngMap({ getters, commit }, isHostOrGuest: string) {
    commit(
      'setcharactersLatLngMap',
      characterService.getInitCharactersLatLngMap(
        getters.characterList,
        isHostOrGuest
      )
    )
  },
  updateCharactersLatLngMap({ state, commit }, isHostOrGuest: string) {
    commit(
      'setcharactersLatLngMap',
      characterService.getUpdatedCharactersLatLngMap(
        state.interactiveCharacter,
        state.charactersLatLngMap,
        isHostOrGuest
      )
    )
  },
  setActiveCharacterStateEnd(context) {
    context.commit('updateInteractiveCharacter', {
      actionState: {
        ...context.state.interactiveCharacter?.actionState,
        isEnd: true
      }
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
    switch (obj.interacter.actionState.name) {
      case 'attack':
        dispatch('attackCharacter', {
          attackerEl: obj.interacterEl,
          attacker: obj.interacter
        })
    }
    dispatch('updateCharactersLatLngMap', obj.isHostOrGuest)
  },
  resetCharacterState(context) {
    context.commit('resetActiveCharacter')
    context.commit('field/finishInteractMode', undefined, { root: true })
    context.commit('field/finishMoveMode', undefined, { root: true })
  }
}
