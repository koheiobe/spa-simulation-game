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
import Character from '~/class/character/playableCharacter'
import Modal from '~/components/utility/Modal.vue'
import BattleDialogue from '~/components/battle/battleDialogue/index.vue'
import { initBattleCharacters } from '~/plugins/database'
import { IUser } from '~/types/store'
const ItemModule = namespace('user')

@Component({
  components: {
    FieldCell,
    SideMenu,
    Modal,
    BattleDialogue
  }
})
export default class Field extends Vue {
  @ItemModule.Getter('getUser')
  private getStoreUser!: IUser

  @Prop({ default: () => [] })
  characters!: Character[]

  @Prop({ default: () => [] })
  deployableAreas!: IDeployableArea[]

  // deploy property
  public deployableArea: ILatlng[] = []
  public selectedCharacterId: number = 0

  // 戦闘モードプロパティ
  // 各characterの移動距離と置き換え
  public moveNum = 8
  public movableArea: ILatlng[] = []
  public interactiveArea: ILatlng[] = []
  public interactiveCharacter: Character | undefined = undefined
  public isBattleDialogueOpen: boolean = false

  @Watch('getStoreUser')
  onChangeStoreUser() {
    console.log('store user', this.getStoreUser)
    initBattleCharacters(this.getStoreUser.uid, this.characters)
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

  startDeployMode(id: number) {
    this.deployableArea = fillDeployableArea(this.deployableAreas)
    this.selectedCharacterId = id
  }

  finishDeployMode() {
    this.deployableArea = []
    this.selectedCharacterId = 0
  }

  onClickCell(cellType: CellType, latLng: ILatlng, cellCharacterId: number) {
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
        this.onCancelBattleAction()
        this.selectCharacter(latLng, cellCharacterId)
    }
  }

  selectCharacter(latLng: ILatlng, cellCharacterId: number) {
    if (cellCharacterId > 0) {
      this.interactiveCharacter = this.characters.find(
        (character) => cellCharacterId === character.id
      )
      this.movableArea = fillMovableArea(latLng, this.moveNum)
    } else {
      this.resetMove()
    }
  }

  deployCharacter(latLng: ILatlng, cellCharacterId: number) {
    this.characters.forEach((character) => {
      if (cellCharacterId === character.id) {
        character.lastLatLng = character.latLng = { x: -1, y: -1 }
      } else if (
        cellCharacterId < 0 &&
        this.selectedCharacterId === character.id
      ) {
        character.lastLatLng = character.latLng = latLng
      }
    })
  }

  moveCharacter(latLng: ILatlng, cellCharacterId: number) {
    if (
      !this.interactiveCharacter ||
      (this.interactiveCharacter.id !== cellCharacterId && cellCharacterId > 0)
    )
      return
    this.characters.forEach((character) => {
      if (
        this.interactiveCharacter &&
        this.interactiveCharacter.id === character.id
      )
        character.latLng = latLng
    })
    this.setModal(true)
    this.movableArea = []
  }

  interactCharacter(cellCharacterId: number) {
    if (this.interactiveCharacter && cellCharacterId > 0) {
      if (this.interactiveCharacter.actionState.name === 'attack') {
        // アタック処理
        console.log('attack', cellCharacterId)
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
    if (this.interactiveCharacter === undefined) return
    this.characters.forEach((character) => {
      if (this.interactiveCharacter!.id !== character.id) return
      if (isCancel) {
        character.latLng = character.lastLatLng
      } else {
        character.lastLatLng = character.latLng
      }
      character.actionState = { name: '' }
    })
    this.setModal(false)
    this.resetMove()
  }

  resetMove() {
    this.interactiveCharacter = undefined
    this.movableArea = this.interactiveArea = []
  }

  onSelectBattleAction(action: ActionType) {
    if (!this.interactiveCharacter) return
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
    if (!this.interactiveCharacter) return
    this.interactiveCharacter.actionState = {
      name: actionType
    }
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
    return this.characters.find(
      (character) =>
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
