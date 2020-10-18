import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { IDeployCharacterState, IRootState } from '~/types/store'
import { ILatlng } from '~/types/battle'

import * as characterService from '~/domain/service/characters'

export const state = (): IDeployCharacterState => ({
  deployCharacterId: ''
})

export const getters: GetterTree<IDeployCharacterState, IRootState> = {
  deployCharacterId: (state) => {
    return state.deployCharacterId
  }
}

export const mutations: MutationTree<IDeployCharacterState> = {
  setDeployCharacterId(state, id) {
    state.deployCharacterId = id
  }
}

export const actions: ActionTree<IDeployCharacterState, IRootState> = {
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
    context.commit(
      'character/character/setCharacterParam',
      {
        id: characterService.getDeployTargetCharacterId(
          obj.cellCharacterId,
          context.state.deployCharacterId
        ),
        value: {
          latLng: updatedLatLng,
          lastLatLng: updatedLatLng
        }
      },
      { root: true }
    )
    context.commit('setDeployCharacterId', '')
  },
  openCharacterModal(
    context,
    obj: { id: string; openModal: (id: string) => void }
  ) {
    context.dispatch('character/character/setActiveCharacter', obj.id, {
      root: true
    })
    obj.openModal(obj.id)
  }
}
