import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter } from '~/types/store'

export const state = () => ({
  list: [] as ICharacter[]
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  getCharacters: (state) => {
    return state.list
  }
}

export const mutations: MutationTree<RootState> = {
  setCharacterParam(state, obj) {
    state.list = state.list.map((character) => {
      return character.id === obj.id
        ? { ...character, ...obj.value }
        : character
    })
  }
}

export const actions: ActionTree<RootState, RootState> = {
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
