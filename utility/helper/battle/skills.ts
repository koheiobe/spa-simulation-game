import { ICharacter } from '~/types/store'
import { sixtyParcent, getRandomVariable } from '~/utility/randNum'
import { CHARACTERS } from '~/constants/characters'

export const counter = (params: {
  taker: ICharacter
  attacker: ICharacter
  onCounter: (takerInfo: {
    updatedTaker: ICharacter
    takerEl: HTMLElement
  }) => any
}): boolean => {
  const { taker, attacker, onCounter } = params
  if (taker.skill.includes('counter') && taker.hp > 0) {
    const takerEl = document.getElementById(taker.id)
    if (!takerEl) return false
    const updatedTaker: ICharacter = {
      ...taker,
      actionState: {
        ...taker.actionState,
        interactLatLng: attacker.latLng
      }
    }
    onCounter({ updatedTaker, takerEl })
    return true
  }
  return false
}

export const sequncialAttack = (params: {
  playerCharacter: ICharacter
  isMyTurn: boolean
  onSequncialAttack: (playerCharacter: ICharacter) => any
}): void => {
  const { playerCharacter, isMyTurn, onSequncialAttack } = params
  if (
    playerCharacter.skill.includes('sequncialAttack') &&
    isMyTurn &&
    sixtyParcent()
  ) {
    onSequncialAttack(playerCharacter)
  }
}

export const summonOnDead = (params: {
  taker: ICharacter
  isMyCharacter: (character: ICharacter | undefined) => boolean
  onSummonCharacter: (summonCharacter: ICharacter) => any
}): void => {
  const { taker, onSummonCharacter, isMyCharacter } = params
  if (
    !isMyCharacter(taker) ||
    !taker.skill.includes('summonOnDead') ||
    taker.hp > 0
  )
    return
  switch (taker.name) {
    case 'WoodCutter':
      onSummonCharacter({ ...CHARACTERS.robot, latLng: taker.lastLatLng })
      break
    case 'Curupira':
      {
        const characterName = getRandomVariable([
          'dinosaur',
          'lochNessMonster',
          'narwhal'
        ])
        onSummonCharacter({
          ...CHARACTERS[characterName],
          latLng: taker.lastLatLng
        })
      }
      break
    case 'BabyDragon':
      onSummonCharacter({ ...CHARACTERS.dragon, latLng: taker.lastLatLng })
      break
    case 'Witch':
      onSummonCharacter({ ...CHARACTERS.wizard, latLng: taker.lastLatLng })
      break
  }
}
