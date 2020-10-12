// import {
//   counter,
//   sequncialAttack,
//   summonOnDead
// } from '~/utility/helper/battle/skills'
// import { ICharacter } from '~/types/store'

// export default class SkillController {
//   setModal: (b: boolean) => void

//   constructor(setModal: (b: boolean) => void) {
//     this.setModal = setModal
//   }

//   activateSkillOnEndAttack(
//     attacker: ICharacter,
//     taker: ICharacter,
//     isMyTurn: boolean,
//     updateStoreCharacter: (character: ICharacter) => void,
//     isHostOrGuest: string
//   ) {
//     const self = this
//     if (
//       counter({
//         taker,
//         attacker,
//         onCounter({ takerEl, updatedTaker }) {
//           self.characterController.attackCharacter(takerEl, updatedTaker)
//         }
//       })
//     )
//       return
//     const playerCharacter = this.characterController.isMyCharacter(
//       attacker,
//       isHostOrGuest
//     )
//       ? attacker
//       : taker
//     sequncialAttack({
//       playerCharacter,
//       isMyTurn,
//       onSequncialAttack(playerCharacter) {
//         self.characterController.updateActiveCharacter({
//           actionState: {
//             ...playerCharacter.actionState,
//             name: '',
//             isEnd: false
//           }
//         })
//         self.setModal(true)
//       }
//     })
//     summonOnDead({
//       taker,
//       isMyCharacter: (c) =>
//         this.characterController.isMyCharacter(c, isHostOrGuest),
//       onSummonCharacter(character) {
//         updateStoreCharacter({
//           ...character,
//           id: character.id + '-' + isHostOrGuest
//         })
//       }
//     })
//   }
// }
