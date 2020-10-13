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
            :cell-type="getModeType({ x, y })"
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
        :active-character="activeCharacter"
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

const CharacterModule = namespace('character')
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

  @CharacterModule.Getter('getActiveCharacter')
  private activeCharacter!: ICharacter

  @CharacterModule.Getter('getDeployCharacterId')
  private deployCharacterId!: ICharacter

  @CharacterModule.Action('setCharacterParam')
  private setCharacterParam!: (characterObj: {
    id: string
    value: any
  }) => Promise<null>

  @CharacterModule.Action('selectDeployTargetCharacter')
  private selectDeployTargetCharacter!: (obj: {
    id: string
    openModal: (id: string) => void
  }) => ICharacter | null

  @CharacterModule.Action('onDeployCharacter')
  private onDeployCharacter!: (obj: {
    latLng: ILatlng
    cellCharacterId: string
  }) => void

  @CharacterModule.Action('onSelectCharacter')
  private onSelectCharacter!: (obj: {
    cellCharacterId: string
    latLng: ILatlng
    charactersLatLngMap: IField
    closeModal: () => void
  }) => void

  // TODO: charactersLatLngMapが存在するため完全に分離できず。分離出来次第、関数名を直す！！
  @CharacterModule.Action('onFinishAction')
  private OnFinishAction!: (isHostOrGuest: string) => void

  @CharacterModule.Action('tryMoveCharacter')
  private tryMoveCharacter!: (obj: {
    latLng: ILatlng
    cellCharacterId: string
    isMyTurn: boolean
    isHostOrGuest: string
  }) => boolean

  @CharacterModule.Action('tryPrepareInteractCharacter')
  private tryPrepareInteractCharacter!: (obj: {
    actionType: string
    weaponType: WeaponType
    itemId: number
  }) => ICharacter | null

  @CharacterModule.Action('onAttackCharacter')
  private onAttackCharacter!: (obj: {
    attackerEl: HTMLElement
    attacker: ICharacter
    battleId: string
  }) => Promise<{ attacker: ICharacter; taker: ICharacter } | null>

  @CharacterModule.Action('tryInteractCharacter')
  private tryInteractCharacter!: (obj: {
    cellCharacterId: string
    isHostOrGuest: string
  }) => boolean

  @CharacterModule.Action('updateCharacter')
  private updateCharacter!: (dbInfo: {
    battleId: string
    character: ICharacter
  }) => Promise<void>

  @CharacterModule.Action('setActiveCharacterStateEnd')
  private setActiveCharacterStateEnd!: () => void

  // TODO: setModalをどう分離するか決まっていないため、一時的に関数名を大文字にする！
  @CharacterModule.Action('resetCharacterState')
  private ResetCharacterState!: () => void

  // TODO: Mutationはなくす！
  @CharacterModule.Mutation('resetActiveCharacter')
  private resetActiveCharacter!: () => void

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
  isMyCharacter!: (character: ICharacter | undefined) => boolean

  @Prop({ default: () => {} })
  charactersLatLngMap!: IField

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
        this.deployCharacter(latLng, cellCharacterId)
        break
      case 'move':
        this.moveCharacter(latLng, cellCharacterId)
        break
      case 'interact':
        this.interactCharacter(cellCharacterId)
        break
      default:
        this.selectCharacter(cellCharacterId, latLng)
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

  deployCharacter(latLng: ILatlng, cellCharacterId: string) {
    this.onDeployCharacter({ latLng, cellCharacterId })
  }

  selectCharacter(cellCharacterId: string, latLng: ILatlng) {
    this.onSelectCharacter({
      cellCharacterId,
      latLng,
      charactersLatLngMap: this.charactersLatLngMap,
      closeModal: () => this.setModal(false)
    })
  }

  moveCharacter(latLng: ILatlng, cellCharacterId: string) {
    if (
      this.tryMoveCharacter({
        latLng,
        cellCharacterId,
        isMyTurn: this.isMyTurn,
        isHostOrGuest: this.isHostOrGuest
      })
    ) {
      this.setModal(true)
    }
  }

  onSelectBattleAction(action: ActionType) {
    switch (action) {
      case 'attack':
        this.prepareInteractCharacter(action, 'closeRange')
        break
      case 'wait':
        this.onFinishAction()
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

  interactCharacter(cellCharacterId: string) {
    if (
      this.tryInteractCharacter({
        isHostOrGuest: this.isHostOrGuest,
        cellCharacterId
      })
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

  onFinishAction() {
    this.$emit('setcharactersLatLngMap', _.cloneDeep(this.activeCharacter))
    this.OnFinishAction(this.isHostOrGuest)
  }

  resetCharacterState() {
    this.ResetCharacterState()
    this.setModal(false)
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
    const attackResultObj = await this.onAttackCharacter({
      attackerEl,
      attacker,
      battleId: this.battleId
    })
    if (!attackResultObj) return
    // TODO: リファクタリング上、スキルは一旦削除
    // this.skillController.activateSkillOnEndAttack(
    //   attackResultObj.attacker,
    //   attackResultObj.taker,
    //   this.isMyTurn,
    //   (character) =>
    //     this.updateCharacter({
    //       battleId: this.battleId,
    //       character
    //     }),
    //   this.isHostOrGuest
    // )
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
    const activeCharacter = this.activeCharacter
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
