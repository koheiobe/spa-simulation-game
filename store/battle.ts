import { ActionTree, MutationTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, IBattleState, IRootState } from '~/types/store'

export const state = (): IBattleState => ({
  characters: [] as ICharacter[],
  interactiveCharacter: undefined
})

export const mutations: MutationTree<IBattleState> = {
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

export const actions: ActionTree<IBattleState, IRootState> = {
  bindCharactersRef: firestoreAction(({ bindFirestoreRef }, ref) => {
    // bindしてからfirestoreではなくvuexの値を更新すると、bindが外れてしまう！
    bindFirestoreRef('characters', ref)
  }),
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
  }
}
