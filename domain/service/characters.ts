import _ from 'lodash'
import { ICharacter } from '~/types/store'
import {
  attackCharacterAnimation,
  takeDamageCharacterAnimation
} from '~/utility/animation'
import {
  calculateDamage,
  onEndCalculateDamage
} from '~/utility/helper/battle/damageCalculator'

export const getMovableCharacter = (
  cellCharacterId: string,
  isMyTurn: boolean,
  isHostOrGuest: string,
  interactiveCharacter: ICharacter | undefined
) => {
  if (!interactiveCharacter) return undefined
  const isMovableCell =
    interactiveCharacter.id === cellCharacterId || cellCharacterId.length === 0
  if (
    isMovableCell &&
    isMyTurn &&
    isMyCharacter(interactiveCharacter, isHostOrGuest) &&
    interactiveCharacter.actionState.isEnd === false
  ) {
    return interactiveCharacter as ICharacter
  }
  return undefined
}

export const getInteractTargetCharacter = (
  cellCharacterId: string,
  isHostOrGuest: string,
  interactiveCharacter: ICharacter | undefined,
  characterList: ICharacter[]
) => {
  if (!interactiveCharacter) return undefined
  const targetCharacter = characterList.find(
    (character) => character.id === cellCharacterId
  )
  if (!targetCharacter || isMyCharacter(targetCharacter, isHostOrGuest))
    return undefined
  return targetCharacter
}

export const isMyCharacter = (
  character: ICharacter | undefined,
  isHostOrGuest: string
) => {
  if (!character) return false
  const matchedSuffix = character.id.match(/-.+()$/)
  if (!matchedSuffix) return false
  return matchedSuffix[0].replace('-', '') === isHostOrGuest
}

export const getUpdatedAttackerAndTaker = async (
  attackerEl: HTMLElement,
  attacker: ICharacter,
  characterList: ICharacter[]
) => {
  await attackCharacterAnimation(attackerEl, attacker)
  const takerLatLng = attacker.actionState.interactLatLng
  const taker = characterList.find(
    (character) =>
      character.latLng.x === takerLatLng.x &&
      character.latLng.y === takerLatLng.y
  )
  if (!taker) return false
  const enemyEl = document.getElementById(taker.id)
  if (!enemyEl) return false
  await takeDamageCharacterAnimation(enemyEl)
  return updateAttackerAndTaker(attacker, taker)
}

const updateAttackerAndTaker = (attacker: ICharacter, taker: ICharacter) => {
  const damage = calculateDamage(attacker, taker)
  const damageTakenCharacter = {
    ...taker,
    hp: taker.hp - damage
  }
  let updatedAttacker = attacker
  if (attacker.skill.includes('bloodSucking')) {
    const suckedHp = attacker.hp + damage
    updatedAttacker = {
      ...attacker,
      hp: suckedHp > attacker.maxHp ? attacker.maxHp : suckedHp
    }
  }
  const finalDamageTakenCharacter = onEndCalculateDamage(damageTakenCharacter)
  if (finalDamageTakenCharacter.hp <= 0) {
    finalDamageTakenCharacter.lastLatLng = finalDamageTakenCharacter.latLng
    finalDamageTakenCharacter.latLng = { x: -1, y: -1 }
  }
  return {
    attacker: _.cloneDeep(updatedAttacker),
    taker: _.cloneDeep(finalDamageTakenCharacter)
  }
}
