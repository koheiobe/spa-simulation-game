import { Vue } from 'vue-property-decorator'
import _ from 'lodash'
import { FieldController } from '../field'
import { ICharacter } from '~/types/store'
import { ActionType, IField, ILatlng, WeaponType } from '~/types/battle'
import {
  attackCharacterAnimation,
  takeDamageCharacterAnimation
} from '~/utility/animation'
import {
  calculateDamage,
  onEndCalculateDamage
} from '~/utility/helper/battle/damageCalculator'

export default class CharacterController extends Vue {
  private activeCharacter: ICharacter | null = null

  getActiveCharacter() {
    return this.activeCharacter
  }

  setActiveCharacter(cellCharacterId: string, fieldCharacters: ICharacter[]) {
    const targetCharacter = fieldCharacters.find(
      (character) => character.id === cellCharacterId
    )
    if (!targetCharacter) {
      console.error('キャラクターが存在しません')
      return
    }
    this.activeCharacter = _.cloneDeep(targetCharacter)
  }

  resetActiveCharacter() {
    this.activeCharacter = null
  }

  updateActiveCharacter(param: any) {
    this.activeCharacter = _.cloneDeep({ ...this.activeCharacter, ...param })
  }

  isActiveCharacterExist() {
    return Boolean(this.activeCharacter)
  }

  onSelectCharacter(
    latLng: ILatlng,
    cellCharacterId: string,
    fieldController: FieldController,
    charactersLatLngMap: IField,
    characterList: ICharacter[]
  ) {
    this.setActiveCharacter(cellCharacterId, characterList)
    if (!this.activeCharacter) return
    fieldController.startMoveMode(
      latLng,
      this.activeCharacter,
      charactersLatLngMap
    )
  }

  moveCharacter(
    latLng: ILatlng,
    cellCharacterId: string,
    isMyTurn: boolean,
    isHostOrGuest: string
  ) {
    if (!this.activeCharacter) return false
    const isMovableCell =
      this.activeCharacter.id === cellCharacterId ||
      cellCharacterId.length === 0
    if (
      isMovableCell &&
      isMyTurn &&
      this.isMyCharacter(this.activeCharacter, isHostOrGuest) &&
      this.activeCharacter.actionState.isEnd === false
    ) {
      this.updateActiveCharacter({
        latLng,
        lastLatLng: this.activeCharacter.latLng
      })
      return true
    }
    return false
  }

  prepareInteractCharacter(
    actionType: ActionType,
    interactType: WeaponType,
    fieldController: FieldController,
    itemId: number = 0
  ) {
    if (this.activeCharacter === null) return
    this.updateActiveCharacter({
      actionState: {
        ...this.activeCharacter.actionState,
        name: actionType,
        itemId
      }
    })

    fieldController.startInteractMode(this.activeCharacter.latLng, interactType)
  }

  interactCharacter(
    cellCharacterId: string,
    fieldCharacters: ICharacter[],
    isHostOrGuest: string
  ): boolean {
    if (!this.activeCharacter) return false
    const targetCharacter = fieldCharacters.find(
      (character) => character.id === cellCharacterId
    )
    if (!targetCharacter || this.isMyCharacter(targetCharacter, isHostOrGuest))
      return false
    this.updateActiveCharacter({
      actionState: {
        ...this.activeCharacter.actionState,
        interactLatLng: targetCharacter.latLng
      }
    })
    return true
  }

  async attackCharacter(
    attackerEl: HTMLElement,
    attacker: ICharacter,
    fieldCharacters: ICharacter[]
  ): Promise<{ attacker: ICharacter; taker: ICharacter } | null> {
    await attackCharacterAnimation(attackerEl, attacker)
    const takerLatLng = attacker.actionState.interactLatLng
    const taker = fieldCharacters.find(
      (character) =>
        character.latLng.x === takerLatLng.x &&
        character.latLng.y === takerLatLng.y
    )
    if (!taker) return null
    const enemyEl = document.getElementById(taker.id)
    if (!enemyEl) return null
    await takeDamageCharacterAnimation(enemyEl)
    return this.updateAttackerAndTaker(attacker, taker)
  }

  private updateAttackerAndTaker(attacker: ICharacter, taker: ICharacter) {
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

  isMyCharacter(character: ICharacter | undefined, isHostOrGuest: string) {
    if (!character) return false
    const matchedSuffix = character.id.match(/-.+()$/)
    if (!matchedSuffix) return false
    return matchedSuffix[0].replace('-', '') === isHostOrGuest
  }
}
