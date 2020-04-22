<template>
  <div :class="$style.field" @click="finishDeployMode">
    <SideMenu
      :characters="storeCharacters"
      :selected-character-id="selectedCharacterId"
      @onClickCharacter="startDeployMode"
      @onSurrender="onSurrender"
    />
    <!-- <div :class="$style.debugArea">
      <button @click="resetMove">デプロイ完了</button>
      <button @click="changeDeployMode">デプロイ</button>
    </div> -->
    <div v-for="n of 30" :key="n" :class="$style.row">
      <template v-for="l of 30">
        <FieldCell
          :key="`${n}-${l}`"
          :cell-type="cellType({ x: l, y: n })"
          :character="getCharacter({ x: l, y: n })"
          :lat-lng="{ x: l, y: n }"
          @onClick="onClickCell"
        >
        </FieldCell>
      </template>
    </div>
    <Modal :is-open="isBattleDialogueOpen" @onClickOuter="onCancelBattleAction">
      <BattleDialogue
        :character-name="characterName"
        @onSelect="onSelectBattleAction"
      />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import {
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
import BattleDialogue from '~/components/battle/battleDialogue/index.vue'
import CharacterRenderer from '~/components/CharacterRenderer.vue'
import { IUser, ICharacter } from '~/types/store'
const ItemUserModule = namespace('user')
const ItemBattleModule = namespace('battle')

@Component({
  components: {
    FieldCell,
    SideMenu,
    Modal,
    BattleDialogue,
    CharacterRenderer
  }
})
export default class Field extends Vue {
  @ItemUserModule.Getter('getUser') private storeUser!: IUser

  @ItemBattleModule.State('interactiveCharacter')
  private interactiveCharacter!: ICharacter | undefined

  @ItemBattleModule.State('list')
  private storeCharacters!: ICharacter[]

  @ItemBattleModule.Action('setCharacterParam')
  private setCharacterParam!: (characterObj: {
    id: string
    value: any
  }) => Promise<null>

  @ItemBattleModule.Mutation('setInteractiveCharacter')
  private setInteractiveCharacter!: (cellCharacterId: string) => void

  @ItemBattleModule.Mutation('updateInteractiveCharacter')
  private updateInteractiveCharacter!: (param: any) => void

  @Prop({ default: () => {} })
  characters!: ICharacter[]

  @Prop({ default: () => [] })
  deployableAreas!: IDeployableArea[]

  // デプロイモードプロパティ
  public deployableArea: { [key: string]: Boolean } = {}
  public selectedCharacterId: string = ''

  // 戦闘モードプロパティ
  // 各characterの移動距離と置き換え
  public moveNum = 8
  public movableArea: { [key: string]: Boolean } = {}
  public interactiveArea: ILatlng[] = []
  public isBattleDialogueOpen: boolean = false

  mounted() {
    if (this.storeUser.uid.length > 0) {
      this.onChangeStoreUser()
    }
  }

  @Watch('storeUser')
  async onChangeStoreUser() {
    if (Object.keys(this.characters).length === 0) {
      console.error(
        'charactersが空なので、オンライン対戦選択ルームから遷移してもらう'
      )
      return
    }
    const dbCharactersRef = this.$firestore.getCharactersRef(
      this.storeUser.battleId
    )
    const dbCharacters = await dbCharactersRef.get()
    if (dbCharacters.empty) {
      this.$firestore.updateCharacters(this.storeUser.battleId, this.characters)
      this.$store.dispatch(
        'battle/setCharactersRef',
        this.$firestore.getCharactersRef(this.storeUser.battleId)
      )
    } else {
      this.$store.dispatch('battle/setCharactersRef', dbCharactersRef)
    }
  }

  cellType(latLng: ILatlng): CellType {
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

  startDeployMode(id: string) {
    this.deployableArea = fillDeployableArea(this.deployableAreas)
    this.selectedCharacterId = id
  }

  finishDeployMode() {
    if (Object.keys(this.deployableArea).length === 0) return
    this.deployableArea = {}
    this.selectedCharacterId = ''
    this.$firestore.updateCharacters(
      this.storeUser.battleId,
      this.storeCharacters
    )
  }

  onClickCell(cellType: CellType, latLng: ILatlng, cellCharacterId: string) {
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
          this.movableArea = fillMovableArea(latLng, this.moveNum)
        } else {
          // インタラクトモードで、アクティブセル以外をクリックした時に状態をキャンセルするため
          this.onCancelBattleAction()
        }
    }
  }

  deployCharacter(latLng: ILatlng, cellCharacterId: string) {
    const updatedLatLng = cellCharacterId.length > 0 ? { x: -1, y: -1 } : latLng
    const characterId =
      cellCharacterId.length > 0 ? cellCharacterId : this.selectedCharacterId
    this.setCharacterParam({
      id: characterId,
      value: {
        latLng: updatedLatLng,
        lastLatLng: updatedLatLng
      }
    })
  }

  moveCharacter(latLng: ILatlng, cellCharacterId: string) {
    const isMovableCell =
      (this.interactiveCharacter &&
        this.interactiveCharacter.id === cellCharacterId) ||
      cellCharacterId.length === 0
    if (isMovableCell) {
      this.updateInteractiveCharacter({ latLng })
      this.setModal(true)
    }
    this.movableArea = {}
  }

  interactCharacter(cellCharacterId: string) {
    if (this.interactiveCharacter && cellCharacterId.length > 0) {
      if (this.interactiveCharacter.actionState.name === 'attack') {
        // アタック処理
        const targetCharacter = this.storeCharacters.find(
          (character) => character.id === cellCharacterId
        )
        if (!targetCharacter || !this.interactiveCharacter) return
        const damageTakenCharacter = {
          ...targetCharacter,
          hp: targetCharacter.hp - this.interactiveCharacter.attackPoint
        }
        this.$firestore.updateCharacter(
          this.storeUser.battleId,
          damageTakenCharacter
        )
      } else if (this.interactiveCharacter.actionState.name === 'item') {
        console.log('item', cellCharacterId)
      }
      this.onFinishBattleAction()
    } else {
      this.onCancelBattleAction()
    }
  }

  onCancelBattleAction() {
    this.onFinishBattleAction(true)
  }

  onFinishBattleAction(isCancel: boolean = false) {
    this.setModal(false)
    this.interactiveArea = []
    this.movableArea = {}

    const interactiveCharacter = this.interactiveCharacter
    if (interactiveCharacter === undefined) return
    const defaultActionState = {
      name: '',
      itemId: 0
    } as const
    const updatedLatLng = isCancel
      ? interactiveCharacter.lastLatLng
      : interactiveCharacter.latLng

    if (!isCancel) {
      const movedCharacter = {
        ...interactiveCharacter,
        latLng: updatedLatLng,
        lastLatLng: updatedLatLng,
        actionState: defaultActionState
      }
      this.$firestore.updateCharacter(this.storeUser.battleId, movedCharacter)
    }
    this.setInteractiveCharacter('')
  }

  onSelectBattleAction(action: ActionType) {
    switch (action) {
      case 'attack':
        this.changeInteractStage(action, 'closeRange')
        break
      case 'wait':
        this.onFinishBattleAction()
        break
      case 'item':
        this.changeInteractStage(action, 'closeRange', 1)
        break
    }
  }

  changeInteractStage(
    actionType: ActionType,
    interactType: WeaponType,
    itemId: number = 0
  ) {
    if (this.interactiveCharacter === undefined) return
    this.setCharacterParam({
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

  setModal(bool: boolean) {
    this.isBattleDialogueOpen = bool
  }

  getCharacter(latLng: ILatlng) {
    if (
      this.interactiveCharacter &&
      this.interactiveCharacter.latLng.x === latLng.x &&
      this.interactiveCharacter.latLng.y === latLng.y
    )
      return this.interactiveCharacter

    return this.storeCharacters.find((character: ICharacter) =>
      this.interactiveCharacter && this.interactiveCharacter.id === character.id
        ? false
        : character.latLng.x === latLng.x && character.latLng.y === latLng.y
    )
  }

  onSurrender() {
    this.$firestore.setBattleId(this.storeUser.uid, '')
    this.$router.push('/battle/online')
  }

  get characterName() {
    return this.interactiveCharacter ? this.interactiveCharacter.id : ''
  }
}
</script>

<style lang="scss" module>
.field {
  // overflow: scroll;
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
