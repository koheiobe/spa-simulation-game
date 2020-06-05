<template>
  <div :class="$style.container">
    <SideMenu
      v-if="!isDeployModeEnd"
      :characters="storeCharacters"
      :selected-character-id="deployCharacterId"
      :is-my-character="isMyCharacter"
      @onClickCharacter="selectDeployCharacter"
      @surrender="$emit('surrender')"
    />
    <div :class="$style.field">
      <div v-for="y of 30" :key="y" :class="$style.row">
        <div v-for="x of 30" :id="`${y}-${x}`" :key="`${y}-${x}`">
          <FieldCell
            :cell-type="decideCellType({ x, y })"
            :character="getCharacterAtCell({ x, y })"
            :lat-lng="{ x, y }"
            :field="field"
            @onClick="onClickCell"
          >
          </FieldCell>
        </div>
      </div>
      <DevFieldUi
        :is-dev-mode="isDevMode"
        @onChangeDevMode="() => (isDevMode = !isDevMode)"
        @onSelectFieldIcon="(newVal) => (selectedFieldIcon = newVal)"
        @saveFieldJson="saveFieldJson"
      />
    </div>
    <Modal :is-open="isBattleModalOpen" @onClickOuter="resetCharacterState">
      <BattleDialogue
        :character="interactiveCharacter"
        :is-my-turn="isMyTurn"
        :is-my-character="() => isMyCharacter(interactiveCharacter)"
        @onSelect="onSelectBattleAction"
      />
    </Modal>
    <!-- 開発用 -->
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import DevFieldUi from './devFieldUi.vue'
import {
  calculateDamage,
  onEndCalculateDamage
} from '~/utility/helper/battle/damageCalculator'
import {
  IField,
  ILatlng,
  ActionType,
  WeaponType,
  CellType
} from '~/types/battle'
import {
  fillMovableArea,
  fillInteractiveArea
} from '~/utility/helper/battle/field'
import FieldCell from '~/components/battle/FieldCell.vue'
import SideMenu from '~/components/battle/SideMenu.vue'
import Modal from '~/components/utility/Modal.vue'
import BattleDialogue from '~/components/battle/ModalContent/Action/index.vue'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import { ICharacter } from '~/types/store'
import { downloadFile } from '~/utility/download'

import {
  attackCharacterAnimation,
  takeDamageCharacterAnimation
} from '~/utility/animation'
import {
  counter,
  sequncialAttack,
  summonOnDead
} from '~/utility/helper/battle/skills'
const CharacterModule = namespace('character')

@Component({
  components: {
    FieldCell,
    SideMenu,
    Modal,
    BattleDialogue,
    CharacterRenderer,
    DevFieldUi
  }
})
export default class Field extends Vue {
  // キャラクターが移動するときに一時的に使用する。行動が完了したらdbに反映
  @CharacterModule.State('interactiveCharacter')
  private interactiveCharacter!: ICharacter | undefined

  @CharacterModule.State('characters')
  private storeCharacters!: ICharacter[]

  @CharacterModule.Action('setCharacterParam')
  private setCharacterParam!: (characterObj: {
    id: string
    value: any
  }) => Promise<null>

  @CharacterModule.Action('updateCharacter')
  private updateCharacter!: (dbInfo: {
    battleId: string
    character: ICharacter
  }) => Promise<void>

  @CharacterModule.Mutation('setInteractiveCharacter')
  private setInteractiveCharacter!: (cellCharacterId: string) => void

  @CharacterModule.Mutation('updateInteractiveCharacter')
  private updateInteractiveCharacter!: (character: ICharacter) => void

  @Prop({ default: null })
  private _winnerCell!: { host: ILatlng; guest: ILatlng }

  @Prop({ default: () => [] })
  deployableArea!: { [key: string]: Boolean }

  @Prop({ default: false })
  isDeployModeEnd!: boolean

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: () => null })
  field!: IField

  @Prop({ default: '' })
  isHostOrGuest!: 'host' | 'guest' | ''

  @Prop({ default: null })
  lastInteractCharacter?: ICharacter

  @Prop({ default: (_: ICharacter | undefined) => false })
  isMyCharacter!: (character: ICharacter | undefined) => boolean

  @Prop({ default: () => {} })
  charactersLatLngMap!: IField

  public deployCharacterId: string = ''
  // 素早くアクセスするためにdeployableAreaとmovableAreaはobjectで作成
  // public deployableArea: { [key: string]: Boolean } = {}
  public movableArea: { [key: string]: Boolean } = {}
  public interactiveArea: ILatlng[] = []
  // TODO: 各characterの移動距離と置き換える
  public moveNum = 8
  public isBattleModalOpen: boolean = false
  private battleId: string = ''
  // 開発用
  private isDevMode = false
  private selectedFieldIcon = ''

  mounted() {
    this.battleId = this.$route.params.id
  }

  decideCellType(latLng: ILatlng): CellType {
    if (Object.keys(this.movableArea).length > 0) {
      return this.movableArea[`${latLng.y}_${latLng.x}`] ? 'move' : null
    } else if (this.interactiveArea.length > 0) {
      return this.isInteractiveArea(latLng) ? 'interact' : null
    } else if (Object.keys(this.deployableArea).length > 0) {
      return this.deployableArea[`${latLng.y}_${latLng.x}`] ? 'deploy' : null
    }
    return null
  }

  isInteractiveArea(latLng: ILatlng) {
    return this.interactiveArea.some(
      (cell) => cell.x === latLng.x && cell.y === latLng.y
    )
  }

  onClickCell(cellType: CellType, latLng: ILatlng, cellCharacterId: string) {
    // 開発用
    if (this.isDevMode) {
      this.mergeField(latLng, this.selectedFieldIcon)
      return
    }

    switch (cellType) {
      case 'deploy':
        this.deployCharacter(latLng, cellCharacterId)
        break
      case 'move':
        this.moveCharacter(latLng, cellCharacterId)
        break
      case 'interact':
        this.interactCharacter(cellCharacterId)
        break
      default:
        // 通常戦闘モード キャラクターを選択するステージ
        if (cellCharacterId.length > 0) {
          this.setInteractiveCharacter(cellCharacterId)
          if (!this.interactiveCharacter) return
          this.movableArea = fillMovableArea(
            latLng,
            this.interactiveCharacter,
            this.charactersLatLngMap
          )
        } else {
          // インタラクトモードで、アクティブセル以外をクリックした時に状態をキャンセルするため
          this.resetCharacterState()
        }
    }
  }

  selectDeployCharacter(id: string) {
    this.deployCharacterId = id
  }

  deployCharacter(latLng: ILatlng, cellCharacterId: string) {
    const isCharacterDeployedCell = cellCharacterId.length > 0
    // クリックしたセルにキャラクターが存在したら、キャラクターを除外
    const updatedLatLng = isCharacterDeployedCell ? { x: -1, y: -1 } : latLng
    const targetCharacterId = isCharacterDeployedCell
      ? cellCharacterId
      : this.deployCharacterId
    // HACK: storeのみを書き換えた結果、vuexfireのrefが外れてしまう。
    // deployモードを終了する時に再度、vuexfireのrefを設定する必要がある
    this.setCharacterParam({
      id: targetCharacterId,
      value: {
        latLng: updatedLatLng,
        lastLatLng: updatedLatLng
      }
    })
    this.deployCharacterId = ''
  }

  moveCharacter(latLng: ILatlng, cellCharacterId: string) {
    if (!this.interactiveCharacter) return
    const isMovableCell =
      this.interactiveCharacter.id === cellCharacterId ||
      cellCharacterId.length === 0
    if (
      isMovableCell &&
      this.isMyTurn &&
      this.isMyCharacter(this.interactiveCharacter) &&
      this.interactiveCharacter.actionState.isEnd === false
    ) {
      this.updateInteractiveCharacter({
        ...this.interactiveCharacter,
        latLng,
        lastLatLng: this.interactiveCharacter.latLng
      })
      this.setModal(true)
    }

    if (
      latLng.x === this.interactiveCharacter.latLng.x &&
      latLng.y === this.interactiveCharacter.latLng.y
    ) {
      this.setModal(true)
    }

    this.movableArea = {}
  }

  onSelectBattleAction(action: ActionType) {
    try {
      if (!this.interactiveCharacter) {
        throw new Error('interactiveCharacter が 存在しません')
      }
      switch (action) {
        case 'attack':
          this.beforeInteractCharacter(action, 'closeRange')
          break
        case 'wait':
          this.onFinishAction(this.interactiveCharacter)
          break
        case 'item':
          this.beforeInteractCharacter(action, 'closeRange', 1)
          break
      }
    } catch (e) {
      console.error(e)
      this.resetCharacterState()
    }
  }

  beforeInteractCharacter(
    actionType: ActionType,
    interactType: WeaponType,
    itemId: number = 0
  ) {
    if (this.interactiveCharacter === undefined) return
    this.updateInteractiveCharacter({
      ...this.interactiveCharacter,
      actionState: {
        ...this.interactiveCharacter.actionState,
        name: actionType,
        itemId
      }
    })
    this.interactiveArea = fillInteractiveArea(
      this.interactiveCharacter.latLng,
      interactType
    )
    this.setModal(false)
  }

  interactCharacter(cellCharacterId: string) {
    try {
      if (!this.interactiveCharacter) {
        throw new Error('interactiveCharacter が 存在しません')
      }
      const targetCharacter = this.storeCharacters.find(
        (character) => character.id === cellCharacterId
      )
      if (targetCharacter) {
        if (this.isMyCharacter(targetCharacter)) return
        this.updateInteractiveCharacter({
          ...this.interactiveCharacter,
          actionState: {
            ...this.interactiveCharacter.actionState,
            interactLatLng: targetCharacter.latLng
          }
        })
        this.onFinishAction(this.interactiveCharacter)
      } else {
        this.resetCharacterState()
      }
    } catch (e) {
      console.error(e)
      this.resetCharacterState()
    }
  }

  useItem(cellCharacterId: string) {
    // TODO: 開発段階
    console.log('item', cellCharacterId)
  }

  async onFinishAction(interactiveCharacter: ICharacter) {
    if (
      interactiveCharacter.latLng.x === this.winnerCell.x &&
      interactiveCharacter.latLng.y === this.winnerCell.y
    ) {
      this.$emit('onWin')
    }
    this.$emit('setLastInteractCharacter', {
      id: this.battleId,
      lastInteractCharacter: interactiveCharacter
    })
    this.$emit('setcharactersLatLngMap', interactiveCharacter)
    await this.applyInteractiveCharacterStore(interactiveCharacter)
    this.resetCharacterState()
  }

  resetCharacterState() {
    this.setInteractiveCharacter('')
    this.setModal(false)
    this.interactiveArea = []
    this.movableArea = {}
  }

  applyInteractiveCharacterStore(
    interactiveCharacter: ICharacter
  ): Promise<void> {
    return this.updateCharacter({
      battleId: this.battleId,
      character: {
        ...interactiveCharacter,
        actionState: {
          ...interactiveCharacter.actionState,
          isEnd: true
        }
      }
    })
  }

  @Watch('lastInteractCharacter')
  onChangeLastInteractCharacter(interacter: ICharacter | undefined) {
    if (!interacter) return
    const interacterEl = document.getElementById(interacter.id)
    if (!interacterEl) return
    switch (interacter.actionState.name) {
      case 'attack':
        this.attackCharacter(interacterEl, interacter)
    }
    this.$emit('setcharactersLatLngMap', interacter)
  }

  async attackCharacter(attackerEl: HTMLElement, attacker: ICharacter) {
    await attackCharacterAnimation(attackerEl, attacker)
    const takerLatLng = attacker.actionState.interactLatLng
    const taker = this.storeCharacters.find(
      (character) =>
        character.latLng.x === takerLatLng.x &&
        character.latLng.y === takerLatLng.y
    )
    if (!taker) return
    const enemyEl = document.getElementById(taker.id)
    if (!enemyEl) return
    await takeDamageCharacterAnimation(enemyEl)
    const damageTakenCharacter = await this.updateDamageTakenCharacter(
      attacker,
      taker
    )
    this.onEndAttackCharacter(attacker, damageTakenCharacter)
  }

  async updateDamageTakenCharacter(attacker: ICharacter, taker: ICharacter) {
    const damage = calculateDamage(attacker, taker)
    const damageTakenCharacter = {
      ...taker,
      hp: taker.hp - damage
    }
    if (attacker.skill.includes('bloodSucking')) {
      const suckedHp = attacker.hp + damage
      await this.updateCharacter({
        battleId: this.battleId,
        character: {
          ...attacker,
          hp: suckedHp > attacker.maxHp ? attacker.maxHp : suckedHp
        }
      })
    }
    const finalDamageTakenCharacter = onEndCalculateDamage(damageTakenCharacter)
    if (finalDamageTakenCharacter.hp <= 0) {
      finalDamageTakenCharacter.lastLatLng = finalDamageTakenCharacter.latLng
      finalDamageTakenCharacter.latLng = { x: -1, y: -1 }
    }
    this.$emit('setcharactersLatLngMap', finalDamageTakenCharacter)
    await this.updateCharacter({
      battleId: this.battleId,
      character: finalDamageTakenCharacter
    })
    return finalDamageTakenCharacter
  }

  onEndAttackCharacter(attacker: ICharacter, taker: ICharacter) {
    const self = this
    if (
      counter({
        taker,
        attacker,
        onCounter({ takerEl, updatedTaker }) {
          self.attackCharacter(takerEl, updatedTaker)
        }
      })
    )
      return
    const playerCharacter = this.isMyCharacter(attacker) ? attacker : taker
    sequncialAttack({
      playerCharacter,
      isMyTurn: this.isMyTurn,
      onSequncialAttack(playerCharacter) {
        self.updateInteractiveCharacter({
          ...playerCharacter,
          actionState: {
            ...playerCharacter.actionState,
            name: '',
            isEnd: false
          }
        })
        self.setModal(true)
      }
    })
    summonOnDead({
      taker,
      isMyCharacter: this.isMyCharacter,
      onSummonCharacter(character) {
        self.updateCharacter({
          battleId: self.battleId,
          character: {
            ...character,
            id: character.id + '-' + self.isHostOrGuest
          }
        })
      }
    })
    this.$emit('setLastInteractCharacter', {
      id: self.battleId,
      lastInteractCharacter: null
    })
  }

  setModal(bool: boolean) {
    this.isBattleModalOpen = bool
  }

  // レンダリングするたびに全てのセルから呼び出されるため、可能な限り処理を軽くする
  getCharacterAtCell(latLng: ILatlng) {
    const existCharacter = this.storeCharacters.find(
      (character: ICharacter) =>
        character.latLng.x === latLng.x && character.latLng.y === latLng.y
    )
    if (this.interactiveCharacter) {
      const isSameId =
        existCharacter && this.interactiveCharacter.id === existCharacter.id
      if (
        this.interactiveCharacter.latLng.x === latLng.x &&
        this.interactiveCharacter.latLng.y === latLng.y
      ) {
        return this.interactiveCharacter
      } else if (isSameId) {
        return undefined
      } else {
        return existCharacter
      }
    } else {
      return existCharacter
    }
  }

  // 開発用
  mergeField(latLng: ILatlng, selectedFieldIcon: string) {
    if (!selectedFieldIcon) {
      delete this.field[`${latLng.y}_${latLng.x}`]
      return
    }
    Vue.set(this.field, `${latLng.y}_${latLng.x}`, { type: selectedFieldIcon })
  }

  // 開発用
  saveFieldJson() {
    const text = JSON.stringify(this.field)
    downloadFile(text, 'json', 'field')
  }

  get characterName() {
    return this.interactiveCharacter ? this.interactiveCharacter.name : ''
  }

  get winnerCell() {
    return this.isHostOrGuest === 'host'
      ? this._winnerCell.host
      : this._winnerCell.guest
  }
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  .debugArea {
    position: fixed;
    left: 300px;
    top: 20px;
  }

  .field {
    background-image: url('../../assets/img/field/mountain.png');
    background-size: 30px 30px;
    min-width: 1381px;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .row {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
