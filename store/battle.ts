import { ActionTree, MutationTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter } from '~/types/store'

interface state {
  characters: ICharacter[]
  interactiveCharacter: ICharacter | undefined
}

export const state = (): state => ({
  characters: [] as ICharacter[],
  interactiveCharacter: undefined
})

export type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  setCharacterParam(state, obj) {
    state.characters = state.characters.map((character) =>
      character.id === obj.id ? { ...character, ...obj.value } : character
    )
  },
  setInteractiveCharacter(state, cellCharacterId: string) {
    state.interactiveCharacter = state.characters.find(
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
    bindFirestoreRef('characters', ref)
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
