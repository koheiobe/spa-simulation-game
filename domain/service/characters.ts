import _ from 'lodash'
import { IField, ILatlng } from '~/types/battle'
import { HostOrGuest, ICharacter } from '~/types/store'
import {
  attackCharacterAnimation,
  takeDamageCharacterAnimation
} from '~/utility/animation'
import {
  calculateDamage,
  onEndCalculateDamage
} from '~/utility/helper/battle/damageCalculator'

export const getCharacterAtCell = (
  characterList: ICharacter[],
  activeCharacter: ICharacter | undefined,
  latLng: ILatlng
) => {
  const existCharacter = characterList.find(
    (character: ICharacter) =>
      character.latLng.x === latLng.x && character.latLng.y === latLng.y
  )
  if (activeCharacter) {
    const isSameId = existCharacter && activeCharacter.id === existCharacter.id
    if (
      activeCharacter.latLng.x === latLng.x &&
      activeCharacter.latLng.y === latLng.y
    ) {
      return activeCharacter
    } else if (isSameId) {
      return undefined
    } else {
      return existCharacter
    }
  } else {
    return existCharacter
  }
}

export const getMovableCharacter = (
  cellCharacterId: string,
  isMyTurn: boolean,
  interactiveCharacter: ICharacter | undefined
) => {
  if (!interactiveCharacter) return undefined
  const isMovableCell =
    interactiveCharacter.id === cellCharacterId || cellCharacterId.length === 0
  if (
    isMovableCell &&
    isMyTurn &&
    interactiveCharacter.actionState.isEnd === false
  ) {
    return interactiveCharacter as ICharacter
  }
  return undefined
}

// TODO: 下記２関数に関しては同じコンテキストで語られないとわかりづらい！
export const getDeployTargetCharacterId = (
  cellCharacterId: string,
  deployCharacterId: string
) => {
  return cellCharacterId.length > 0 ? cellCharacterId : deployCharacterId
}
export const getDeployTargetCharacterLatlng = (
  cellCharacterId: string,
  latLng: ILatlng
) => {
  // クリックしたセルにキャラクターが存在したら、キャラクターを除外
  return cellCharacterId.length > 0 ? { x: -1, y: -1 } : latLng
}

export const getInteractTargetCharacter = (
  interactiveCharacter: ICharacter | undefined,
  interactedCharacter: ICharacter
) => {
  if (!interactiveCharacter) return undefined
  if (!interactedCharacter) return undefined
  return interactedCharacter
}

export const isMyCharacter = (
  character: ICharacter | undefined,
  isHostOrGuest: HostOrGuest | ''
) => {
  if (!character || isHostOrGuest.length <= 0) return false
  const matchedSuffix = character.id.match(/-.+()$/)
  if (!matchedSuffix) return false
  return matchedSuffix[0].replace('-', '') === isHostOrGuest
}

export const getInitCharactersLatLngMap = (enemyCharacter: ICharacter[]) =>
  enemyCharacter.reduce((acum, cur) => {
    if (cur.latLng.x > 0) {
      acum[`${cur.latLng.y}_${cur.latLng.x}`] = {
        type: 'character'
      }
    }
    return acum
  }, {} as IField)

export const updatCharactersLatLngMap = (
  activeCharacter: ICharacter,
  charactersLatLngMap: IField
): IField => {
  if (activeCharacter.latLng.x <= 0 || activeCharacter.latLng.x <= 0)
    return charactersLatLngMap
  const { lastLatLng, latLng } = activeCharacter
  delete charactersLatLngMap[`${lastLatLng.y}_${lastLatLng.x}`]
  if (latLng.x > 0) {
    charactersLatLngMap[`${latLng.y}_${latLng.x}`] = {
      type: 'character'
    }
  }
  return charactersLatLngMap
}

export const getUpdatedAttackerAndTaker = async (
  attackerEl: HTMLElement,
  attacker: ICharacter,
  taker: ICharacter
) => {
  await attackCharacterAnimation(attackerEl, attacker)

  if (!taker) return undefined
  const enemyEl = document.getElementById(taker.id)
  if (!enemyEl) return undefined
  await takeDamageCharacterAnimation(enemyEl)
  return updateAttackerAndTaker(attacker, taker)
}

const updateAttackerAndTaker = (attacker: ICharacter, taker: ICharacter) => {
  const damage = calculateDamage(attacker, taker)
  const damageTakenCharacter = {
    ...taker,
    hp: taker.hp - damage
  }
  let updatedAttacker: ICharacter = {
    ...attacker,
    actionState: { ...attacker.actionState, isEnd: true }
  }
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
