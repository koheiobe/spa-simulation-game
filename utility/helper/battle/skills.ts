import { ICharacter } from '~/types/store'
import { sixtyParcent } from '~/utility/randNum'

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
