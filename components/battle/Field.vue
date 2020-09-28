<template>
  <div :class="$style.container">
    <SideMenu
      v-if="isDeploying"
      :characters="characterList"
      :selected-character-id="deployCharacterId"
      :is-my-character="isMyCharacter"
      :is-host-or-guest="isHostOrGuest"
      @onClickCharacter="selectDeployCharacter"
      @surrender="$emit('surrender')"
    />
    <div :class="$style.field">
      <div v-for="y of 30" :key="y" :class="$style.row">
        <div v-for="x of 30" :id="`${y}-${x}`" :key="`${y}-${x}`">
          <FieldCell
            :cell-type="fieldController.getModeType({ x, y })"
            :character="getCharacterAtCell({ x, y })"
            :is-host-or-guest="isHostOrGuest"
            :lat-lng="{ x, y }"
            :field="field"
            @onClick="onClickCell"
          ></FieldCell>
        </div>
      </div>
      <!-- フィールド開発用UI -->
      <!-- <DevFieldUi
        :is-dev-mode="isDevMode"
        @onChangeDevMode="() => (isDevMode = !isDevMode)"
        @onSelectFieldIcon="(newVal) => (selectedFieldIcon = newVal)"
        @saveFieldJson="saveFieldJson"
      />-->
    </div>
    <Modal :is-open="isBattleModalOpen" @onClickOuter="resetCharacterState">
      <BattleDialogue
        :character-controller="characterController"
        :is-my-turn="isMyTurn"
        :is-deploying="isDeploying"
        :is-host-or-guest="isHostOrGuest"
        @on-select="onSelectBattleAction"
      />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import _ from 'lodash'
import DevFieldUi from './devFieldUi.vue'
import { IField, ILatlng, ActionType } from '~/types/battle'
import { FieldController } from '~/utility/helper/battle/field/index'
import FieldCell from '~/components/battle/FieldCell.vue'
import SideMenu from '~/components/battle/SideMenu.vue'
import Modal from '~/components/utility/Modal.vue'
import BattleDialogue from '~/components/battle/ModalContent/Action/index.vue'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import { ICharacter } from '~/types/store'
import { downloadFile } from '~/utility/download'
import CharacterController from '~/utility/helper/battle/character/characterController'
import SkillController from '~/utility/helper/battle/character/skillController'

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
  @CharacterModule.State('characters')
  private characterList!: ICharacter[]

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

  @Prop({ default: false })
  isDeployModeEnd!: boolean

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: () => null })
  field!: IField

  @Prop({ default: '' })
  isHostOrGuest!: 'host' | 'guest'

  @Prop({ default: null })
  lastInteractCharacter?: ICharacter

  @Prop({ default: (_: ICharacter | undefined) => false })
  isMyCharacter!: (character: ICharacter | undefined) => boolean

  @Prop({ default: () => {} })
  charactersLatLngMap!: IField

  @Prop({ default: '' })
  battleId!: string

  @Prop({ default: {} })
  fieldController!: FieldController

  // TODO: 各characterの移動距離と置き換える
  public deployCharacterId: string = ''
  public isBattleModalOpen: boolean = false
  public characterController: CharacterController
  public skillController: SkillController

  // 開発用
  private isDevMode = false
  private selectedFieldIcon = ''

  constructor() {
    super()

    this.characterController = new CharacterController()
    this.skillController = new SkillController(
      this.setModal,
      this.characterController
    )
  }

  onClickCell(latLng: ILatlng, cellCharacterId: string) {
    // 開発用
    if (this.isDevMode) {
      this.mergeField(latLng, this.selectedFieldIcon)
      return
    }

    switch (this.fieldController.getModeType(latLng)) {
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
        // キャラクターを選択する
        if (cellCharacterId.length > 0) {
          this.characterController.setActiveCharacter(
            cellCharacterId,
            this.characterList
          )
          const activeCharacter = this.characterController.getActiveCharacter()
          if (!activeCharacter) return
          this.fieldController.startMoveMode(
            latLng,
            activeCharacter,
            this.charactersLatLngMap
          )
        } else {
          // インタラクトモードで、アクティブセル以外をクリックした時に状態をキャンセルするため
          this.resetCharacterState()
        }
    }
  }

  selectDeployCharacter(id: string) {
    if (this.deployCharacterId === id) {
      this.characterController.setActiveCharacter(id, this.characterList)
      this.setModal(true)
    }
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
    if (
      this.characterController.moveCharacter(
        latLng,
        cellCharacterId,
        this.isMyTurn,
        this.isHostOrGuest
      )
    ) {
      this.setModal(true)
      this.fieldController.finishMoveMode()
    }
  }

  onSelectBattleAction(action: ActionType) {
    switch (action) {
      case 'attack':
        this.characterController.prepareInteractCharacter(
          action,
          'closeRange',
          this.fieldController
        )
        break
      case 'wait':
        this.onFinishAction()
        break
      case 'item':
        this.characterController.prepareInteractCharacter(
          action,
          'closeRange',
          this.fieldController,
          0
        )
        break
    }
    this.setModal(false)
  }

  interactCharacter(cellCharacterId: string) {
    if (
      this.characterController.interactCharacter(
        cellCharacterId,
        this.characterList,
        this.isHostOrGuest
      )
    ) {
      this.onFinishAction()
    } else {
      this.resetCharacterState()
    }
  }

  useItem(cellCharacterId: string) {
    // TODO: 開発段階
    console.log('item', cellCharacterId)
  }

  async onFinishAction() {
    const activeCharacter = this.characterController.getActiveCharacter()
    if (!activeCharacter) return
    if (
      activeCharacter.latLng.x === this.winnerCell.x &&
      activeCharacter.latLng.y === this.winnerCell.y
    ) {
      this.$emit('onWin')
    }
    activeCharacter.actionState.isEnd = true
    await this.applyActiveCharacterStore(activeCharacter)
    this.$emit('setLastInteractCharacter', {
      id: this.battleId,
      lastInteractCharacter: _.cloneDeep(activeCharacter)
    })
    this.$emit('setcharactersLatLngMap', _.cloneDeep(activeCharacter))
    this.resetCharacterState()
  }

  applyActiveCharacterStore(activeCharacter: ICharacter): Promise<void> {
    return this.updateCharacter({
      battleId: this.battleId,
      character: _.cloneDeep(activeCharacter)
    })
  }

  resetCharacterState() {
    this.characterController.resetActiveCharacter()
    this.setModal(false)
    this.fieldController.finishInteractMode()
    this.fieldController.finishMoveMode()
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
    const attackResultObj = await this.characterController.attackCharacter(
      attackerEl,
      attacker,
      this.characterList
    )
    if (!attackResultObj) return
    attackResultObj.attacker.actionState.isEnd = true
    this.updateCharacter({
      battleId: this.battleId,
      character: _.cloneDeep(attackResultObj.attacker)
    })
    this.updateCharacter({
      battleId: this.battleId,
      character: _.cloneDeep(attackResultObj.taker)
    })
    this.onEndAttackCharacter(attackResultObj.attacker, attackResultObj.taker)
  }

  onEndAttackCharacter(attacker: ICharacter, taker: ICharacter) {
    this.skillController.activateSkillOnEndAttack(
      attacker,
      taker,
      this.isMyTurn,
      this.characterList,
      (character) =>
        this.updateCharacter({
          battleId: this.battleId,
          character
        }),
      this.isHostOrGuest
    )
    this.$emit('setLastInteractCharacter', {
      id: this.battleId,
      lastInteractCharacter: null
    })
  }

  setModal(bool: boolean) {
    this.isBattleModalOpen = bool
  }

  // レンダリングするたびに全てのセルから呼び出されるため、可能な限り処理を軽くする
  getCharacterAtCell(latLng: ILatlng) {
    const existCharacter = this.characterList.find(
      (character: ICharacter) =>
        character.latLng.x === latLng.x && character.latLng.y === latLng.y
    )
    const activeCharacter = this.characterController.getActiveCharacter()
    if (activeCharacter) {
      const isSameId =
        existCharacter && activeCharacter.id === existCharacter.id
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

  get winnerCell() {
    return this.fieldController.getWinnerCell(this.isHostOrGuest)
  }

  get isDeploying() {
    return this.fieldController.isDeploying()
  }
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  justify-content: center;
  flex-direction: column;

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
