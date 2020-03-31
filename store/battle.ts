import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, RootState } from '~/types/store'

export const state: { list: ICharacter[] } = {
  list: []
}

export const getters: GetterTree<{ list: ICharacter[] }, RootState> = {
  getCharacters: (state) => {
    return state.list
  }
}

export const mutations: MutationTree<{ list: ICharacter[] }> = {
  setCharacterParam(state, obj) {
    state.list = state.list.map((character) => {
      return character.id === obj.id
        ? { ...character, ...obj.value }
        : character
    })
  }
}

export const actions: ActionTree<{ list: ICharacter[] }, RootState> = {
  setCharactersRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    bindFirestoreRef('list', ref)
  }),
  setLatLng(context, obj) {
    context.commit('setCharacterParam', {
      id: obj.id,
      value: {
        latLng: obj.value.latLng,
        lastLatLng: obj.value.lastLatLng
      }
    })
  },
  setActionState(context, obj) {
    context.commit('setCharacterParam', {
      id: obj.id,
      value: {
        actionState: {
          name: obj.value.name,
          itemId: obj.value.itemId
        }
      }
    })
  }
}
