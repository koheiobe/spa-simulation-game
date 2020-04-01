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

// export const mutations: MutationTree<{ list: ICharacter[] }> = {
//   setCharacterParam(state, obj) {
//     state.list = state.list.map((character) => {
//       return character.id === obj.id
//         ? { ...character, ...obj.value }
//         : character
//     })
//   },
//   setLatLng(state, obj) {
//     state.list = state.list.map((character) =>
//       character.id === obj.id
//         ? {
//             ...character,
//             actionState: { ...character.actionState },
//             latLng: obj.value.latLng,
//             lastLatLng: obj.value.lastLatLng
//           }
//         : character
//     )
//   },
//   setActionState(state, obj) {
//     state.list = state.list.map((character) =>
//       character.id === obj.id
//         ? {
//             ...character,
//             latLng: { ...character.latLng },
//             lastLatLng: { ...character.lastLatLng },
//             actionState: {
//               name: obj.value.actionState.name,
//               itemId: obj.value.actionState.itemId
//             }
//           }
//         : character
//     )
//   }
// }
