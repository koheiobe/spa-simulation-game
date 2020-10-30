import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { firestoreAction } from 'vuexfire'
import { ICharacter, ICharacterState, IRootState } from '~/types/store'
import { CHARACTERS } from '~/constants/characters'
import { ActionType } from '~/types/battle'
import * as characterService from '~/domain/service/characters'

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
  bindCharactersRef: firestoreAction(
    ({ bindFirestoreRef }, ref): Promise<firebase.firestore.DocumentData[]> => {
      // bindしてからfirestoreではなくvuexの値を更新すると、bindが外れてしまう！
      return bindFirestoreRef('characters', ref)
    }
  ),
  syncVuexFirestoreCharacters({ dispatch }, battleId) {
    const dbCharactersRef = this.$firestore.getCharactersRef(battleId)
    return dispatch('bindCharactersRef', dbCharactersRef)
  },
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
  },
  async initCharacters(
    { dispatch },
    obj: {
      isMyCharacter: (character: ICharacter) => boolean
      isHostOrGuest: 'host' | 'guest' | ''
      battleId: string
    }
  ) {
    const firestoreCharacters = await dispatch(
      'syncVuexFirestoreCharacters',
      obj.battleId
    )

    if (
      firestoreCharacters.some((character: ICharacter) =>
        obj.isMyCharacter(character as ICharacter)
      )
    )
      return firestoreCharacters

    const characterList = CHARACTERS as { [name: string]: ICharacter }
    const characters = [] as ICharacter[]
    const hostOrGuest = obj.isHostOrGuest
    Object.keys(characterList).forEach((key) => {
      characters.push({
        ...characterList[key],
        id: characterList[key].id + '-' + hostOrGuest
      })
    })
    const randomCharacters = characterService.getRandomCharacters(characters)

    dispatch('updateCharacters', {
      battleId: obj.battleId,
      characters: randomCharacters
    })
    return randomCharacters
  },
  initMyCharacter({ dispatch, getters }, { battleId, isMyCharacter }: { battleId: string, isMyCharacter: (character: ICharacter) => boolean }) {
    return dispatch("updateCharacters", {
      battleId: battleId,
      // 敵キャラクターまで初期化すると、ローカルに存在する敵キャラクターのデータで
      // 敵がすでに変更したfirestore上の敵キャラクターデータを上書きしてしまうためfilterする
      characters: getters.characterList.filter((character: ICharacter) =>
        isMyCharacter(character)
      )
    })
  },
  initCharactersActionState({ dispatch, getters }, battleId) {
    const initActionStatesCharacter = getters.characterList.map((character: ICharacter) => ({
      ...character,
      actionState: {
        ...character.actionState,
        name: '' as ActionType,
        isEnd: false
      }
    }))
    dispatch("updateCharacters", {
      battleId: battleId,
      characters: initActionStatesCharacter
    })
  }
}
