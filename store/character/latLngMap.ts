import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { IRootState, ICharacterLatLngMapState } from '~/types/store'
import { IField } from '~/types/battle'

import * as characterService from '~/domain/service/characters'

export const state = (): ICharacterLatLngMapState => ({
  charactersLatLngMap: {}
})

export const getters: GetterTree<ICharacterLatLngMapState, IRootState> = {
  charactersLatLngMap: (state) => {
    return state.charactersLatLngMap
  }
}

export const mutations: MutationTree<ICharacterLatLngMapState> = {
  setcharactersLatLngMap(state, charactersLatLngMap: IField) {
    state.charactersLatLngMap = charactersLatLngMap
  }
}

export const actions: ActionTree<ICharacterLatLngMapState, IRootState> = {
  initCharactersLatLngMap({ commit, rootGetters }) {
    commit(
      'setcharactersLatLngMap',
      characterService.getInitCharactersLatLngMap(
        rootGetters['character/character/myCharacterList']
      )
    )
  },
  updateCharactersLatLngMap({ state, commit, rootGetters }) {
    commit(
      'setcharactersLatLngMap',
      characterService.getUpdatedCharactersLatLngMap(
        rootGetters['character/activeCharacter/activeCharacter'],
        state.charactersLatLngMap
      )
    )
  }
}
