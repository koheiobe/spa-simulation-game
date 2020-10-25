import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'

export const state = (): ICharacterState => ({
  characters: [] as ICharacter[]
})

export const getters: GetterTree<ICharacterState, IRootState> = {
  characterList: (state) => {
    return state.characters
  }
}

export const mutations: MutationTree<ICharacterState> = {
  setCharacterParam(state, obj) {
    state.characters = state.characters.map((character) =>
      character.id === obj.id ? { ...character, ...obj.value } : character
    )
  }
}

export const actions: ActionTree<ICharacterState, IRootState> = {
  // setActiveCharacter({ state, commit }, cellCharacterId: string) {
  //   const activeCharacter = state.characters.find(
  //     (character) => cellCharacterId === character.id
  //   )
  //   commit('character/activeCharacter/setActiveCharacter', activeCharacter, {
  //     root: true
  //   })
  // },
  // updateActiveCharacter({ commit }, param) {
  //   commit('character/activeCharacter/updateActiveCharacter', param, {
  //     root: true
  //   })
  // },
  bindCharactersRef: firestoreAction(
    ({ bindFirestoreRef }, ref): Promise<firebase.firestore.DocumentData[]> => {
      // bindしてからfirestoreではなくvuexの値を更新すると、bindが外れてしまう！
      return bindFirestoreRef('characters', ref)
    }
  ),
  updateCharacter(_, dbInfo: { battleId: string; character: ICharacter }) {
    return this.$firestore.updateCharacter(dbInfo.battleId, dbInfo.character)
  },
  updateCharacters(_, dbInfo: { battleId: string; characters: ICharacter[] }) {
    return this.$firestore.updateCharacters(dbInfo.battleId, dbInfo.characters)
  },
  setCharacterParam({ commit }, obj) {
    commit('setCharacterParam', {
      id: obj.id,
      value: obj.value
    })
  }
}
