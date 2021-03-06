import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { IRootState, ICharacterLatLngMapState, ICharacter } from '~/types/store'
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
  },
  updateCharactersLatLngMap(state, activeCharacter: ICharacter) {
    state.charactersLatLngMap = characterService.updatCharactersLatLngMap(
      activeCharacter,
      state.charactersLatLngMap
    )
  }
}

export const actions: ActionTree<ICharacterLatLngMapState, IRootState> = {
  initCharactersLatLngMap({ commit, rootGetters }) {
    commit(
      'setcharactersLatLngMap',
      characterService.getInitCharactersLatLngMap(
        rootGetters['helper/character/enemyCharacterList']
      )
    )
  },
  updateCharactersLatLngMap(
    { commit, rootGetters },
    activeCharacter: ICharacter
  ) {
    console.log(activeCharacter)
    console.log(rootGetters['helper/character/isMyCharacter'](activeCharacter))
    if (rootGetters['helper/character/isMyCharacter'](activeCharacter)) return
    commit('updateCharactersLatLngMap', activeCharacter)
  }
}
