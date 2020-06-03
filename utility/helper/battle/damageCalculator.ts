import { ICharacter } from 'types/store'
import { fiftyParcent } from '~/utility/randNum'

export const getDamageTakenCharacter = (info: {
  attacker: ICharacter
  taker: ICharacter
}) => {
  const { attacker, taker } = info
  const damageTakenCharacter = {
    ...taker,
    hp: taker.hp - calculateDamage(attacker, taker)
  }
  const finalDamageTakenCharacter = onEndCalculateDamage(damageTakenCharacter)
  return finalDamageTakenCharacter
}

const calculateDamage = (attacker: ICharacter, taker: ICharacter): number => {
  const enemyDefence = calculateTakerDefense(taker)
  const attackPoint = calculateAttackerPoint(attacker)
  const tempDamage = attackPoint - enemyDefence
  return tempDamage > 0 ? tempDamage : 0
}

const calculateTakerDefense = (taker: ICharacter) => {
  return taker.defense
}

const calculateAttackerPoint = (attacker: ICharacter) => {
  return attacker.attackPoint
}

const onEndCalculateDamage = (damageTakenCharacter: ICharacter): ICharacter => {
  if (
    damageTakenCharacter.skill.includes('undead') &&
    damageTakenCharacter.hp <= 0
  ) {
    return fiftyParcent()
      ? { ...damageTakenCharacter, hp: 1 }
      : damageTakenCharacter
  }
  return damageTakenCharacter
}
