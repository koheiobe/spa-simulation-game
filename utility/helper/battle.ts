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
  // if (enemy.skill) {
  //   if (enemy.skill.includes('undead')) {
  //     if (Math.floor(Math.random() * 100) % 2 === 0) {
  //       return 0
  //     }
  //     return attackPoint - enemyDefence
  //   }
  // }
  return damageTakenCharacter
}

const calculateDamage = (
  enemy: ICharacter,
  myCharacter: ICharacter
): number => {
  const enemyDefence = calculateEnemyDefense(enemy)
  const attackPoint = calculateAttackPoint(myCharacter)
  const tempDamage = attackPoint - enemyDefence
  const damage = tempDamage > 0 ? tempDamage : 0
  return damage
}

const calculateEnemyDefense = (enemy: ICharacter) => {
  return enemy.defense
}

const calculateAttackPoint = (myCharacter: ICharacter) => {
  return myCharacter.attackPoint
}
