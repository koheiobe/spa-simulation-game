import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter } from '~/types/store'

interface state {
  list: ICharacter[]
  interactiveCharacter: ICharacter | undefined
}

export const state = (): state => ({
  list: [] as ICharacter[],
  interactiveCharacter: undefined
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  getCharacters: (state) => {
    return state.list
  },
  interactiveCharacter: (state) => {
    return state.interactiveCharacter === undefined
      ? undefined
      : state.list.find(
          (character) => character.id === state.interactiveCharacter!.id
        )
  }
}

export const mutations: MutationTree<RootState> = {
  setCharacterParam(state, obj) {
    state.list = state.list.map((character) => {
      return character.id === obj.id
        ? { ...character, ...obj.value }
        : character
    })
  },
  setInteractiveCharacter(state, cellCharacterId: string) {
    state.interactiveCharacter = state.list.find(
      (character) => cellCharacterId === character.id
    )
  },
  updateInteractiveCharacter(state, param) {
    state.interactiveCharacter = { ...state.interactiveCharacter, ...param }
  }
}

export const actions: ActionTree<RootState, RootState> = {
  bindCharactersRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    // bindしてからfirestoreではなくvuexの値を更新すると、bindが外れてしまう！
    bindFirestoreRef('list', ref)
  }),
  updateCharacter(_, dbInfo: { battleId: string; character: ICharacter }) {
    this.$firestore.updateCharacter(dbInfo.battleId, dbInfo.character)
  },
  updateCharacters(_, dbInfo: { battleId: string; characters: ICharacter[] }) {
    this.$firestore.updateCharacters(dbInfo.battleId, dbInfo.characters)
  },
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
