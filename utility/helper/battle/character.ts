import { ICharacter } from '~/types/store'
import { EXCEPTION_CHARACTERS_NAME } from '~/constants/characters'

const CAHARACTERS_NUM = 25

export const getRandomCharacters = (characters: ICharacter[]) => {
  const randomCharacters: ICharacter[] = []
  while (randomCharacters.length < CAHARACTERS_NUM) {
    const index = Math.floor((Math.random() * 100) % characters.length)
    const character = characters[index]
    if (
      randomCharacters.includes(character) ||
      EXCEPTION_CHARACTERS_NAME.includes(character.name)
    ) {
      continue
    } else {
      randomCharacters.push(characters[index])
    }
  }
  return randomCharacters
}
