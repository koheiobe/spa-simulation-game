<template>
  <div :class="$style.field" @click="finishDeployMode">
    <SideMenu
      :characters="storeCharacters"
      :selected-character-id="deployCharacterId"
      :is-my-character="isMyCharacter"
      @onClickCharacter="startDeployMode"
      @surrender="surrender"
    />
    <div v-for="n of 30" :key="n" :class="$style.row">
      <template v-for="l of 30">
        <FieldCell
          :key="`${n}-${l}`"
          :cell-type="decideCellType({ x: l, y: n })"
          :character="getCharacterAtCell({ x: l, y: n })"
          :lat-lng="{ x: l, y: n }"
          :field="field"
          @onClick="onClickCell"
        >
        </FieldCell>
      </template>
    </div>
    <!-- 開発用 -->
    <DevFieldUi
      :is-dev-mode="isDevMode"
      @onChangeDevMode="() => (isDevMode = !isDevMode)"
      @onSelectFieldIcon="(newVal) => (selectedFieldIcon = newVal)"
      @saveFieldJson="saveFieldJson"
    />
    <!-- !開発用 -->
    <Modal :is-open="isBattleModalOpen" @onClickOuter="resetCharacterState">
      <BattleDialogue
        :character="interactiveCharacter"
        :is-my-turn="isMyTurn"
        :is-my-character="isMyCharacter(interactiveCharacter)"
        @onSelect="onSelectBattleAction"
      />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import DevFieldUi from './devFieldUi.vue'
import {
  IField,
  ILatlng,
  IDeployableArea,
  ActionType,
  WeaponType,
  CellType
} from '~/types/battle'
import {
  fillDeployableArea,
  fillMovableArea,
  fillInteractiveArea
} from '~/utility/helper/field'
import FieldCell from '~/components/battle/FieldCell.vue'
import SideMenu from '~/components/battle/SideMenu.vue'
import Modal from '~/components/utility/Modal.vue'
import BattleDialogue from '~/components/battle/ModalContent/Action/index.vue'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import { IUser, ICharacter, IBattleRoom } from '~/types/store'
import { downloadFile } from '~/utility/download'
const ItemUserModule = namespace('user')
const ItemBattleModule = namespace('battle')
const ItemBattleRoomsModule = namespace('battleRooms')

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
  @ItemUserModule.Getter('getUser') private storeUser!: IUser

  // キャラクターが移動するときに一時的に使用する。行動が完了したらdbに反映
  @ItemBattleModule.State('interactiveCharacter')
  private interactiveCharacter!: ICharacter | undefined

  @ItemBattleModule.State('characters')
  private storeCharacters!: ICharacter[]

  @ItemBattleModule.Action('setCharacterParam')
  private setCharacterParam!: (characterObj: {
    id: string
    value: any
  }) => Promise<null>

  @ItemBattleModule.Action('updateCharacter')
  private updateCharacter!: (dbInfo: {
    battleId: string
    character: ICharacter
  }) => Promise<void>

  @ItemBattleModule.Action('updateCharacters')
  private updateCharacters!: (dbInfo: {
    battleId: string
    characters: ICharacter[]
  }) => Promise<null>

  @ItemBattleModule.Mutation('setInteractiveCharacter')
  private setInteractiveCharacter!: (cellCharacterId: string) => void

  @ItemBattleModule.Mutation('updateInteractiveCharacter')
  private updateInteractiveCharacter!: (param: any) => void

  @ItemBattleRoomsModule.State('battleRoom')
  private battleRoom!: IBattleRoom

  @Prop({ default: () => [] })
  deployableAreas!: IDeployableArea[]

  @Prop({ default: false })
  isMyTurn!: boolean

  @Prop({ default: () => null })
  field!: IField

  @Prop({ default: '' })
  isHostOrGuest!: 'host' | 'guest' | ''

  @Prop({ default: () => () => {} })
  syncVuexFirestoreCharacters!: (
    characters: ICharacter[],
    battleId: string
  ) => void

  public deployCharacterId: string = ''
  // 素早くアクセスするためにdeployableAreaとmovableAreaはobjectで作成
  public deployableArea: { [key: string]: Boolean } = {}
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

  startDeployMode(id: string) {
    this.deployableArea = fillDeployableArea(this.deployableAreas)
    this.deployCharacterId = id
  }

  // HACK デプロイ画面と戦闘画面、違う画面に分けた方がいいかもしれない
  async finishDeployMode() {
    if (Object.keys(this.deployableArea).length === 0) return
    this.deployableArea = {}
    this.deployCharacterId = ''
    await this.updateCharacters({
      battleId: this.battleId,
      characters: this.storeCharacters
    })
    // deployCharacterのthis.setCharacterParamをすると
    // vuexとfirestoreの参照が外れるため再度、同期させる必要がある
    this.syncVuexFirestoreCharacters(this.storeCharacters, this.battleId)
  }

  deployCharacter(latLng: ILatlng, cellCharacterId: string) {
    const isCharacterDeployedCell = cellCharacterId.length > 0
    // クリックしたセルにキャラクターが存在したら、キャラクターを除外
    const updatedLatLng = isCharacterDeployedCell ? { x: -1, y: -1 } : latLng
    const targetCharacterId = isCharacterDeployedCell
      ? cellCharacterId
      : this.deployCharacterId
    this.setCharacterParam({
      id: targetCharacterId,
      value: {
        latLng: updatedLatLng,
        lastLatLng: updatedLatLng
      }
    })
  }

  moveCharacter(latLng: ILatlng, cellCharacterId: string) {
    if (!this.interactiveCharacter) return
    const isMovableCell =
      this.interactiveCharacter.id === cellCharacterId ||
      cellCharacterId.length === 0
    if (
      isMovableCell &&
      this.isMyTurn &&
      this.isMyCharacter(this.interactiveCharacter)
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
      value: {
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
      if (cellCharacterId.length > 0) {
        switch (this.interactiveCharacter.actionState.name) {
          case 'attack':
            this.attackCharacter(cellCharacterId)
            break
          case 'item':
            this.useItem(cellCharacterId)
            break
        }
        this.onFinishAction(this.interactiveCharacter)
      } else {
        this.resetCharacterState()
      }
    } catch (e) {
      console.error(e)
      this.resetCharacterState()
    }
  }

  attackCharacter(cellCharacterId: string) {
    const targetCharacter = this.storeCharacters.find(
      (character) => character.id === cellCharacterId
    )
    if (!targetCharacter || !this.interactiveCharacter) return
    const damageTakenCharacter = {
      ...targetCharacter,
      hp: targetCharacter.hp - this.interactiveCharacter.attackPoint
    }
    this.updateCharacter({
      battleId: this.battleId,
      character: damageTakenCharacter
    })
  }

  useItem(cellCharacterId: string) {
    console.log('item', cellCharacterId)
  }

  async onFinishAction(interactiveCharacter: ICharacter) {
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
    const defaultActionState = {
      name: '',
      itemId: 0
    } as const
    const actedCharacter = {
      ...interactiveCharacter,
      latLng: interactiveCharacter.latLng,
      lastLatLng: interactiveCharacter.latLng,
      actionState: defaultActionState
    }
    return this.updateCharacter({
      battleId: this.battleId,
      character: actedCharacter
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

  surrender() {
    this.$emit('surrender')
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
