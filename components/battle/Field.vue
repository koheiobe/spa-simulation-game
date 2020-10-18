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
          <!-- FieldCellの関数はレンダリングするたびに全てのセルから呼び出されるため、可能な限り処理を軽くする -->
          <FieldCell
            :cell-type="getModeType({ x, y })"
            :character="characterAtCell({ x, y })"
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
    <Modal :is-open="isBattleModalOpen" @onClickOuter="onClickModalOuter">
      <BattleDialogue
        :active-character="activeCharacter"
        :is-my-turn="isMyTurn"
        :is-deploying="isDeploying"
        :is-my-character="isMyCharacter"
        @on-select="onSelectBattleAction"
      />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import DevFieldUi from './devFieldUi.vue'
import {
  IField,
  ILatlng,
  ActionType,
  WeaponType,
  CellType
} from '~/types/battle'
import FieldCell from '~/components/battle/FieldCell.vue'
import SideMenu from '~/components/battle/SideMenu.vue'
import Modal from '~/components/utility/Modal.vue'
import BattleDialogue from '~/components/battle/ModalContent/Action/index.vue'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import { ICharacter } from '~/types/store'
import { downloadFile } from '~/utility/download'

const CharacterModule = namespace('character/character')
const FieldModule = namespace('field')

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
  @CharacterModule.State('characters')
  private characterList!: ICharacter[]

  @CharacterModule.Getter('activeCharacter')
  private activeCharacter!: ICharacter

  @CharacterModule.Getter('deployCharacterId')
  private deployCharacterId!: ICharacter

  @CharacterModule.Getter('characterAtCell')
  private characterAtCell!: (latLng: ILatlng) => undefined | ICharacter

  @CharacterModule.Action('selectDeployTargetCharacter')
  private selectDeployTargetCharacter!: (obj: {
    id: string
    openModal: (id: string) => void
  }) => ICharacter | null

  @CharacterModule.Action('deployCharacter')
  private deployCharacter!: (obj: {
    latLng: ILatlng
    cellCharacterId: string
  }) => void

  @CharacterModule.Action('selectCharacter')
  private selectCharacter!: (obj: {
    cellCharacterId: string
    latLng: ILatlng
  }) => void

  @CharacterModule.Action('onFinishAction')
  private onFinishAction!: (isHostOrGuest: string) => void

  @CharacterModule.Action('tryMoveCharacter')
  private tryMoveCharacter!: (obj: {
    latLng: ILatlng
    cellCharacterId: string
    isMyTurn: boolean
    isHostOrGuest: string
    succeeded: () => void
  }) => boolean

  @CharacterModule.Action('tryPrepareInteractCharacter')
  private tryPrepareInteractCharacter!: (obj: {
    actionType: string
    weaponType: WeaponType
    itemId: number
  }) => ICharacter | null

  @CharacterModule.Action('tryInteractCharacter')
  private tryInteractCharacter!: (obj: {
    cellCharacterId: string
    isHostOrGuest: string
  }) => boolean

  @CharacterModule.Action('onChangeLastInteractCharacter')
  private onChangeLastInteractCharacter!: (obj: {
    interacterEl: HTMLElement
    interacter: ICharacter
    isHostOrGuest: string
  }) => void

  @CharacterModule.Action('resetCharacterState')
  private resetCharacterState!: () => void

  @FieldModule.Getter('modeType')
  private getModeType!: (latLng: ILatlng) => CellType | ''

  @FieldModule.Getter('isDeploying')
  private isDeploying!: () => boolean

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: () => null })
  field!: IField

  @Prop({ default: '' })
  isHostOrGuest!: 'host' | 'guest'

  @Prop({ default: null })
  lastInteractCharacter?: ICharacter

  @Prop({ default: (_: ICharacter | undefined) => false })
  isMyCharacter!: (character: ICharacter) => boolean

  @Prop({ default: '' })
  battleId!: string

  public isBattleModalOpen: boolean = false

  // 開発用
  private isDevMode = false
  private selectedFieldIcon = ''

  onClickCell(latLng: ILatlng, cellCharacterId: string) {
    // 開発用
    if (this.isDevMode) {
      this.mergeField(latLng, this.selectedFieldIcon)
      return
    }

    switch (this.getModeType(latLng)) {
      case 'deploy':
        this.deployCharacter({ latLng, cellCharacterId })
        break
      case 'move':
        this.tryMoveCharacter({
          latLng,
          cellCharacterId,
          isMyTurn: this.isMyTurn,
          isHostOrGuest: this.isHostOrGuest,
          succeeded: () => this.setModal(true)
        })
        break
      case 'interact':
        this.interactCharacter(cellCharacterId)
        break
      default:
        // キャラクターが存在した場合
        if (cellCharacterId.length > 0) {
          this.selectCharacter({
            cellCharacterId,
            latLng
          })
          // キャラクターが存在しないセルをクリックした場合、すべての行動をキャンセル
        } else {
          this.resetCharacterState()
          this.setModal(false)
        }
    }
  }

  selectDeployCharacter(id: string) {
    this.selectDeployTargetCharacter({
      id,
      openModal: (_) => {
        this.setModal(true)
      }
    })
  }

  onSelectBattleAction(action: ActionType) {
    switch (action) {
      case 'attack':
        this.prepareInteractCharacter(action, 'closeRange')
        break
      case 'wait':
        this.onFinishAction(this.isHostOrGuest)
        break
      case 'item':
        this.prepareInteractCharacter(action, 'closeRange', 0)
        break
    }
    this.setModal(false)
  }

  prepareInteractCharacter(
    actionType: string,
    weaponType: WeaponType,
    itemId = 0
  ) {
    this.tryPrepareInteractCharacter({
      actionType,
      weaponType,
      itemId
    })
  }

  async interactCharacter(cellCharacterId: string) {
    if (
      await !this.tryInteractCharacter({
        isHostOrGuest: this.isHostOrGuest,
        cellCharacterId
      })
    ) {
      this.setModal(false)
    }
  }

  useItem(cellCharacterId: string) {
    // TODO: 開発段階
    console.log('item', cellCharacterId)
  }

  onClickModalOuter() {
    this.resetCharacterState()
    this.setModal(false)
  }

  // 最後に行動をとったキャラクターの状態をプレイヤー1とプレイヤー2の画面に反映させる
  @Watch('lastInteractCharacter')
  syncLastInteractCharacter(interacter: ICharacter | undefined) {
    if (!interacter) return
    const interacterEl = document.getElementById(interacter.id)
    if (!interacterEl) return
    this.onChangeLastInteractCharacter({
      interacterEl,
      interacter,
      isHostOrGuest: this.isHostOrGuest
    })
  }

  setModal(bool: boolean) {
    this.isBattleModalOpen = bool
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
