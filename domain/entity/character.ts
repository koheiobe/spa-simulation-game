// import _ from 'lodash'
// import { ICharacter } from '~/types/store'
// import { ILatlng } from '~/types/battle'
// import {
//   attackCharacterAnimation,
//   takeDamageCharacterAnimation
// } from '~/utility/animation'
// import {
//   calculateDamage,
//   onEndCalculateDamage
// } from '~/utility/helper/battle/damageCalculator'

// export default class Character {
//   private character: ICharacter | null = null

//   constructor(character: ICharacter) {
//     this.character = character
//   }

//   moveCharacter(
//     latLng: ILatlng,
//     cellCharacterId: string,
//     isMyTurn: boolean,
//     isHostOrGuest: string
//   ) {
//     if (!this.character) return false
//     const isMovableCell =
//       this.character.id === cellCharacterId || cellCharacterId.length === 0
//     if (
//       isMovableCell &&
//       isMyTurn &&
//       // TODO: このクラスは必ず自分のキャラクターのはずなので、ここの処理は不要なはず
//       // this.isMyCharacter(this.character, isHostOrGuest) &&
//       this.character.actionState.isEnd === false
//     ) {
//       // TODO: DAOと差し替え
//       // this.updateActiveCharacter({
//       //   latLng,
//       //   lastLatLng: this.character.latLng
//       // })
//       return true
//     }
//     return false
//   }

//   // prepareInteractCharacter(
//   //   actionType: ActionType,
//   //   interactType: WeaponType,
//   //   fieldController: FieldController,
//   //   itemId: number = 0
//   // ) {
//   //   if (this.character === null) return
//   //   this.updateActiveCharacter({
//   //     actionState: {
//   //       ...this.character.actionState,
//   //       name: actionType,
//   //       itemId
//   //     }
//   //   })

//   //   fieldController.startInteractMode(this.character.latLng, interactType)
//   // }

//   interactCharacter(
//     cellCharacterId: string,
//     isHostOrGuest: string,
//     targetCharacter
//   ): boolean {
//     if (!this.character) return false
//     // TODO: このクラスは必ず自分のキャラクターのはずなので、ここの処理は不要なはず
//     // if (!targetCharacter || this.isMyCharacter(targetCharacter, isHostOrGuest))
//     // return false
//     // TODO: DAOと差し替え
//     // this.updateActiveCharacter({
//     //   actionState: {
//     //     ...this.character.actionState,
//     //     interactLatLng: targetCharacter.latLng
//     //   }
//     // })
//     return true
//   }

//   async attackCharacter(
//     attackerEl: HTMLElement,
//     attacker: ICharacter,
//     taker: ICharacter
//   ): Promise<{ attacker: ICharacter; taker: ICharacter } | null> {
//     await attackCharacterAnimation(attackerEl, attacker)

//     if (!taker) return null
//     const enemyEl = document.getElementById(taker.id)
//     if (!enemyEl) return null
//     await takeDamageCharacterAnimation(enemyEl)
//     return this.updateAttackerAndTaker(attacker, taker)
//   }

//   private updateAttackerAndTaker(attacker: ICharacter, taker: ICharacter) {
//     const damage = calculateDamage(attacker, taker)
//     const damageTakenCharacter = {
//       ...taker,
//       hp: taker.hp - damage
//     }
//     let updatedAttacker = attacker
//     if (attacker.skill.includes('bloodSucking')) {
//       const suckedHp = attacker.hp + damage
//       updatedAttacker = {
//         ...attacker,
//         hp: suckedHp > attacker.maxHp ? attacker.maxHp : suckedHp
//       }
//     }
//     const finalDamageTakenCharacter = onEndCalculateDamage(damageTakenCharacter)
//     if (finalDamageTakenCharacter.hp <= 0) {
//       finalDamageTakenCharacter.lastLatLng = finalDamageTakenCharacter.latLng
//       finalDamageTakenCharacter.latLng = { x: -1, y: -1 }
//     }
//     return {
//       attacker: _.cloneDeep(updatedAttacker),
//       taker: _.cloneDeep(finalDamageTakenCharacter)
//     }
//   }
// }
