import _ from 'lodash'
import { ICharacter } from '~/types/store'
import { ILatlng } from '~/types/battle'
import {
  attackCharacterAnimation,
  takeDamageCharacterAnimation
} from '~/utility/animation'
import {
  calculateDamage,
  onEndCalculateDamage
} from '~/utility/helper/battle/damageCalculator'

export default class CharacterController {
  public characterList: ICharacter[] = []
  private activeCharacter: ICharacter | null = null
  private deployCharacterId: string = ''

  public getActiveCharacter() {
    return this.activeCharacter
  }

  public getDeployCharacterId() {
    return this.deployCharacterId
  }

  public setCharacterList(characterList: ICharacter[]) {
    this.characterList = characterList
  }

  public resetActiveCharacter() {
    this.activeCharacter = null
  }

  public updateActiveCharacter(param: any) {
    this.activeCharacter = _.cloneDeep({ ...this.activeCharacter, ...param })
  }

  public isActiveCharacterExist() {
    return this.activeCharacter != null
  }

  public selectDeployCharacter(
    id: string,
    onSelectDeployedCharacter: (id: string) => any
  ) {
    if (this.deployCharacterId === id) {
      this.setActiveCharacter(id)
      onSelectDeployedCharacter(id)
    }
    this.deployCharacterId = id
  }

  public deployCharacter(
    latLng: ILatlng,
    cellCharacterId: string,
    updateDB: (targetCharacterId: string, updatedLatLng: ILatlng) => any
  ) {
    const isCharacterDeployedCell = cellCharacterId.length > 0
    // クリックしたセルにキャラクターが存在したら、キャラクターを除外
    const updatedLatLng = isCharacterDeployedCell ? { x: -1, y: -1 } : latLng
    const targetCharacterId = isCharacterDeployedCell
      ? cellCharacterId
      : this.deployCharacterId
    this.deployCharacterId = ''
    updateDB(targetCharacterId, updatedLatLng)
  }

  public onSelectCharacter(cellCharacterId: string) {
    this.setActiveCharacter(cellCharacterId)
  }

  public moveCharacter(
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

  public interactCharacter(
    cellCharacterId: string,
    isHostOrGuest: string
  ): boolean {
    if (!this.activeCharacter) return false
    const targetCharacter = this.characterList.find(
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

  public async attackCharacter(
    attackerEl: HTMLElement,
    attacker: ICharacter
  ): Promise<{ attacker: ICharacter; taker: ICharacter } | null> {
    await attackCharacterAnimation(attackerEl, attacker)
    const takerLatLng = attacker.actionState.interactLatLng
    const taker = this.characterList.find(
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

  public isMyCharacter(
    character: ICharacter | undefined,
    isHostOrGuest: string
  ) {
    if (!character) return false
    const matchedSuffix = character.id.match(/-.+()$/)
    if (!matchedSuffix) return false
    return matchedSuffix[0].replace('-', '') === isHostOrGuest
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

  private setActiveCharacter(cellCharacterId: string) {
    const targetCharacter = this.characterList.find(
      (character) => character.id === cellCharacterId
    )
    if (!targetCharacter) {
      console.error('キャラクターが存在しません')
      return
    }
    this.activeCharacter = _.cloneDeep(targetCharacter)
  }
}
