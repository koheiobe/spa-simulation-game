import { GetterTree } from 'vuex'
import { IRootState, ICharacter } from '~/types/store'

export const getters: GetterTree<{}, IRootState> = {
  isMyCharacter: (_1, _2, _3, rootGetters) => (
    character: ICharacter
  ): boolean => {
    const isHostOrGuest = rootGetters['helper/battleRoom/isHostOrGuest']
    if (!character || isHostOrGuest.length <= 0) return false
    const matchedSuffix = character.id.match(/-.+()$/)
    if (!matchedSuffix) return false
    return matchedSuffix[0].replace('-', '') === isHostOrGuest
  },
  enemyCharacterList: (_1, getters, _3, rootGetters) => {
    return rootGetters['character/character/characterList'].reduce(
      (acum: ICharacter[], cur: ICharacter) => {
        if (!getters.isMyCharacter(cur as ICharacter)) {
          acum.push(cur)
        }
        return acum
      },
      [] as ICharacter[]
    )
  }
}
