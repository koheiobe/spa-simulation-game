<template>
  <div :class="$style.field">
    <SideMenu
      v-if="!isDeployModeEnd"
      :characters="storeCharacters"
      :selected-character-id="deployCharacterId"
      :is-my-character="isMyCharacter"
      @onClickCharacter="selectDeployCharacter"
      @surrender="$emit('surrender')"
    />
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
    <Modal :is-open="isBattleModalOpen" @onClickOuter="resetCharacterState">
      <BattleDialogue
        :character="interactiveCharacter"
        :is-my-turn="isMyTurn"
        :is-my-character="isMyCharacter(interactiveCharacter)"
        @onSelect="onSelectBattleAction"
      />
    </Modal>
    <!-- 開発用 -->
    <DevFieldUi
      :is-dev-mode="isDevMode"
      @onChangeDevMode="() => (isDevMode = !isDevMode)"
      @onSelectFieldIcon="(newVal) => (selectedFieldIcon = newVal)"
      @saveFieldJson="saveFieldJson"
    />
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import DevFieldUi from './devFieldUi.vue'
import { getDamageTakenCharacter } from '~/utility/helper/battle/damageCalculator'
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
import { sixtyParcent } from '~/utility/randNum'
import {
  attackCharacterAnimation,
  takeDamageCharacterAnimation
} from '~/utility/animation'
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

  @CharacterModule.Action('updateCharacters')
  private updateCharacters!: (dbInfo: {
    battleId: string
    characters: ICharacter[]
  }) => Promise<null>

  @CharacterModule.Mutation('setInteractiveCharacter')
  private setInteractiveCharacter!: (cellCharacterId: string) => void

  @CharacterModule.Mutation('updateInteractiveCharacter')
  private updateInteractiveCharacter!: (param: any) => void

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
            this.interactiveCharacter.moveDistance
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
      this.updateInteractiveCharacter({ latLng })
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
      id: this.interactiveCharacter.id,
      actionState: {
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
        this.interactiveCharacter.actionState.interactLatLng =
          targetCharacter.latLng
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
    this.$emit('setLastInteractCharacter', {
      id: this.battleId,
      lastInteractCharacter: interactiveCharacter
    })
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

  isMyCharacter(character: ICharacter) {
    if (!character) return false
    const matchedSuffix = character.id.match(/-.+()$/)
    if (!matchedSuffix) return false
    return matchedSuffix[0].replace('-', '') === this.isHostOrGuest
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

  @Watch('lastInteractCharacter')
  onChangeLastInteractCharacter(newState: ICharacter | undefined) {
    if (!newState) return
    const characterEl = document.getElementById(newState.id)
    if (!characterEl) return
    switch (newState.actionState.name) {
      case 'attack':
        attackCharacterAnimation(characterEl, newState, () =>
          this.onEndAttackAnimation(newState)
        )
    }
  }

  onEndAttackAnimation(character: ICharacter) {
    const enemyLatLng = character.actionState.interactLatLng
    const enemy = this.storeCharacters.find(
      (character) =>
        character.latLng.x === enemyLatLng.x &&
        character.latLng.y === enemyLatLng.y
    )
    if (!enemy) return
    const enemyEl = document.getElementById(enemy.id)
    if (!enemyEl) return
    takeDamageCharacterAnimation(enemyEl, () => {
      this.attackCharacter(enemy, character)
    })
  }

  attackCharacter(enemy: ICharacter, myCharacter: ICharacter) {
    const damageTakenCharacter = getDamageTakenCharacter({ myCharacter, enemy })
    if (damageTakenCharacter.hp <= 0) {
      damageTakenCharacter.latLng = { x: -1, y: -1 }
    }
    this.updateCharacter({
      battleId: this.battleId,
      character: damageTakenCharacter
    })
    if (myCharacter.skill.includes('sequncialAttack') && sixtyParcent()) {
      this.$emit('setLastInteractCharacter', {
        id: this.battleId,
        lastInteractCharacter: null
      })
      this.updateInteractiveCharacter({ ...myCharacter, isEnd: false })
      this.setModal(true)
    }
  }

  get characterName() {
    return this.interactiveCharacter ? this.interactiveCharacter.name : ''
  }
}
</script>

<style lang="scss" module>
.field {
  .debugArea {
    position: fixed;
    left: 300px;
    top: 20px;
  }

  .row {
    display: flex;
  }
}
</style>
