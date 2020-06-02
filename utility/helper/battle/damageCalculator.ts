import { ICharacter } from 'types/store'

export const getDamageTakenCharacter = (info: {
  myCharacter: ICharacter
  enemy: ICharacter
}) => {
  const { myCharacter, enemy } = info
  const damageTakenCharacter = {
    ...enemy,
    hp: enemy.hp - calculateDamage(enemy, myCharacter)
  }
  const finalDamageTakenCharacter = onEndCalculateDamage(damageTakenCharacter)
  return finalDamageTakenCharacter
}

const calculateDamage = (
  enemy: ICharacter,
  myCharacter: ICharacter
): number => {
  const enemyDefence = calculateEnemyDefense(enemy)
  const attackPoint = calculateAttackPoint(myCharacter)
  const tempDamage = attackPoint - enemyDefence
  return tempDamage > 0 ? tempDamage : 0
}

const calculateEnemyDefense = (enemy: ICharacter) => {
  return enemy.defense
}

const calculateAttackPoint = (myCharacter: ICharacter) => {
  return myCharacter.attackPoint
}

const onEndCalculateDamage = (damageTakenCharacter: ICharacter): ICharacter => {
  if (
    damageTakenCharacter.skill.includes('undead') &&
    damageTakenCharacter.hp <= 0
  ) {
    return Math.floor(Math.random() * 10) % 2 === 0
      ? { ...damageTakenCharacter, hp: 1 }
      : damageTakenCharacter
  }
  return damageTakenCharacter
}
