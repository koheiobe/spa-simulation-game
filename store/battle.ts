import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, RootState } from '~/types/store'

interface state {
  list: ICharacter[]
}

export const state = () => ({
  list: []
})

export const getters: GetterTree<state, RootState> = {
  getCharacters: (state) => {
    return state.list
  }
}

export const mutations: MutationTree<state> = {
  setCharacterParam(state, obj) {
    state.list = state.list.map((character) => {
      return character.id === obj.id
        ? { ...character, ...obj.value }
        : character
    })
  }
}

export const actions: ActionTree<state, RootState> = {
  setCharactersRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    bindFirestoreRef('list', ref)
  }),
  setCharacterParam(context, obj) {
    return new Promise((resolve) => {
      context.commit('setCharacterParam', {
        id: obj.id,
        value: obj.value
      })
      resolve()
    })
  }
}
