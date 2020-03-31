<template>
  <div :class="$style.field" @click="finishDeployMode">
    <SideMenu
      :characters="characters"
      :selected-character-id="selectedCharacterId"
      @onClickCharacter="startDeployMode"
    />
    <!-- <div :class="$style.debugArea">
      <button @click="resetMove">デプロイ完了</button>
      <button @click="changeDeployMode">デプロイ</button>
    </div> -->
    <div v-for="n of 60" :key="n" :class="$style.row">
      <template v-for="l of 60">
        <FieldCell
          :key="`${n}-${l}`"
          :is-character-deployable-cell="isDeployableArea({ x: l, y: n })"
          :is-character-movable-cell="isMovableArea({ x: l, y: n })"
          :is-interactable-cell="isInteractiveArea({ x: l, y: n })"
          :character="getCharacter({ x: l, y: n })"
          :lat-lng="{ x: l, y: n }"
          @onClick="onClickCell"
        />
      </template>
    </div>
    <Modal :is-open="isBattleDialogueOpen" @onClickOuter="onCancelBattleAction">
      <BattleDialogue @onSelect="onSelectBattleAction" />
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
import { initDBCharacters, getCharactersRef } from '~/plugins/database'
import { IUser, ICharacter } from '~/types/store'
const ItemUserModule = namespace('user')
const ItemBattleModule = namespace('battle')

@Component({
  components: {
    FieldCell,
    SideMenu,
    Modal,
    BattleDialogue
  }
})
export default class Field extends Vue {
  @ItemUserModule.Getter('getUser')
  private storeUser!: IUser

  @ItemBattleModule.Getter('getCharacters')
  private storeCharacters!: ICharacter[]

  @Prop({ default: () => {} })
  characters!: ICharacter[]

  @Prop({ default: () => [] })
  deployableAreas!: IDeployableArea[]

  // deploy property
  public deployableArea: ILatlng[] = []
  public selectedCharacterId: string = ''

  // 戦闘モードプロパティ
  // 各characterの移動距離と置き換え
  public moveNum = 8
  public movableArea: ILatlng[] = []
  public cellCharacterId: string = ''
  public interactiveArea: ILatlng[] = []
  public isBattleDialogueOpen: boolean = false

  mounted() {
    if (this.storeUser.uid.length > 0) {
      this.onChangeStoreUser()
    }
  }

  @Watch('storeUser')
  onChangeStoreUser() {
    if (Object.keys(this.characters).length === 0) {
      console.error(
        'charactersがnullなので、オンライン対戦選択ルームから遷移してもらう'
      )
      return
    }
    initDBCharacters(
      this.storeUser.uid,
      this.storeUser.battleId,
      this.characters
    )
    this.$store.dispatch(
      'battle/setCharactersRef',
      getCharactersRef(this.storeUser.battleId, this.storeUser.uid)
    )
  }

  get interactiveCharacter() {
    return this.storeCharacters.find(
      (character) => this.cellCharacterId === character.id
    )
  }

  isDeployableArea(latLng: ILatlng) {
    return this.deployableArea.some(
      (movable) => movable.x === latLng.x && movable.y === latLng.y
    )
  }

  isMovableArea(latLng: ILatlng) {
    return this.movableArea.some(
      (movable) => movable.x === latLng.x && movable.y === latLng.y
    )
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
    this.deployableArea = []
    this.selectedCharacterId = ''
  }

  onClickCell(cellType: CellType, latLng: ILatlng, cellCharacterId: string) {
    switch (cellType) {
      case 'deploy':
        this.deployCharacter(latLng, cellCharacterId)
        break
      case 'move':
        this.moveCharacter(latLng)
        break
      case 'interact':
        this.interactCharacter()
        break
      default:
        this.selectCharacter(latLng, cellCharacterId)
    }
  }

  selectCharacter(latLng: ILatlng, cellCharacterId: string) {
    if (cellCharacterId.length > 0) {
      this.cellCharacterId = cellCharacterId
      this.movableArea = fillMovableArea(latLng, this.moveNum)
    } else {
      // インタラクトモードで、アクティブセル以外をクリックした時に状態をキャンセルするため
      this.onCancelBattleAction()
    }
  }

  deployCharacter(latLng: ILatlng, cellCharacterId: string) {
    this.$store.dispatch(
      'battle/setLatLng',
      this.cellCharacterId.length > 0
        ? {
            id: cellCharacterId,
            value: {
              latLng: { x: -1, y: -1 },
              lastLatLng: { x: -1, y: -1 }
            }
          }
        : {
            id: this.selectedCharacterId,
            value: {
              latLng,
              lastLatLng: latLng
            }
          }
    )
  }

  moveCharacter(latLng: ILatlng) {
    const interactiveCharacter = this.interactiveCharacter
    if (!interactiveCharacter) return
    if (
      interactiveCharacter.id === this.cellCharacterId ||
      this.cellCharacterId.length === 0
    ) {
      this.$store.dispatch('battle/setLatLng', {
        id: interactiveCharacter.id,
        value: {
          latLng,
          lastLatLng: interactiveCharacter.lastLatLng
        }
      })
      this.setModal(true)
    }
    this.movableArea = []
  }

  interactCharacter() {
    const interactiveCharacter = this.interactiveCharacter
    if (interactiveCharacter && this.cellCharacterId.length > 0) {
      if (interactiveCharacter.actionState.name === 'attack') {
        // アタック処理
        console.log('attack', this.cellCharacterId)
      } else if (interactiveCharacter.actionState.name === 'item') {
        console.log('item', this.cellCharacterId)
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
    const interactiveCharacter = this.interactiveCharacter
    if (interactiveCharacter === undefined) return
    this.$store.dispatch('battle/setLatLng', {
      id: interactiveCharacter.id,
      value: isCancel
        ? {
            latLng: interactiveCharacter.lastLatLng,
            lastLatLng: interactiveCharacter.lastLatLng
          }
        : {
            latLng: interactiveCharacter.latLng,
            lastLatLng: interactiveCharacter.latLng
          }
    })
    this.$store.dispatch('battle/setActionState', {
      id: interactiveCharacter.id,
      value: {
        actionState: {
          name: ''
        }
      }
    })
    this.setModal(false)
    this.resetMove()
  }

  resetMove() {
    this.cellCharacterId = ''
    this.movableArea = this.interactiveArea = []
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
        this.changeInteractStage(action, 'closeRange')
        break
    }
  }

  changeInteractStage(actionType: ActionType, interactType: WeaponType) {
    const interactiveCharacter = this.interactiveCharacter
    if (interactiveCharacter === undefined) return
    this.$store.dispatch('battle/setActionState', {
      id: interactiveCharacter.id,
      value: {
        name: actionType
      }
    })
    this.interactiveArea = fillInteractiveArea(
      interactiveCharacter.latLng,
      interactType
    )
    this.setModal(false)
  }

  setModal(bool: boolean) {
    this.isBattleDialogueOpen = bool
  }

  getCharacter(latLng: ILatlng) {
    return this.storeCharacters.find(
      (character: ICharacter) =>
        character.latLng.x === latLng.x && character.latLng.y === latLng.y
    )
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
