<template>
  <div :class="$style.field" @click="finishDeployMode">
    <SideMenu
      :characters="characters"
      :selected-character-id="selectedCharacterId"
      @onClickCharacter="onClickSideMenuCharacter"
    />
    <div v-for="n of 100" :key="n" :class="$style.row">
      <template v-for="l of 100">
        <FieldCell
          :key="`${n}-${l}`"
          :is-character-placable-cell="
            isMovableArea({ x: l, y: n }) || isDeployableArea({ x: l, y: n })
          "
          :is-interactive-cell="isInteractiveArea({ x: l, y: n })"
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
import { Vue, Prop } from 'vue-property-decorator'
import { ILatlng, IDeployableArea, ActionType } from '~/types/battle'
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

@Component({
  components: {
    FieldCell,
    SideMenu,
    Modal,
    BattleDialogue
  }
})
export default class Field extends Vue {
  @Prop({ default: () => [] })
  characters!: Character[]

  @Prop({ default: () => [] })
  deployableAreas!: IDeployableArea[]

  // デプロイモードプロパティ
  public deployableArea: ILatlng[] = []
  public selectedCharacterId: number = 0
  public deployMode: boolean = false

  // 戦闘モードプロパティ
  // 各characterの移動距離と置き換え
  public moveNum = 8
  public movableArea: ILatlng[] = []
  public interactiveArea: ILatlng[] = []
  public interactCharacter: Character | undefined = undefined
  public isBattleDialogueOpen: boolean = false

  mounted() {
    this.deployableArea = fillDeployableArea(this.deployableAreas)
  }

  isDeployableArea(latLng: ILatlng) {
    return this.deployMode
      ? this.deployableArea.some(
          (movable) => movable.x === latLng.x && movable.y === latLng.y
        )
      : false
  }

  onClickSideMenuCharacter(id: number) {
    this.selectedCharacterId = id
    this.deployMode = true
  }

  finishDeployMode() {
    this.deployMode = false
    this.selectedCharacterId = 0
  }

  onClickCell(
    latLng: ILatlng,
    isPlacable: boolean,
    isInteractable: boolean,
    characterId: number
  ) {
    // 戦闘開始前のデプロイモード時
    if (this.deployMode && isPlacable) {
      this.characters.forEach((character) => {
        if (characterId === character.id) {
          character.lastLatLng = character.latLng = { x: -1, y: -1 }
        } else if (
          characterId < 0 &&
          this.selectedCharacterId === character.id
        ) {
          character.lastLatLng = character.latLng = latLng
        }
      })
      return
    }

    // 通常戦闘モード
    this.movableArea = []
    this.interactiveArea = []
    console.log(`isPlacable: ${isPlacable}, isInteractable: ${isInteractable}`)
    // this.interactCharacter = undefined
    if (characterId > 0) {
      this.interactCharacter = this.characters.find(
        (character) => characterId === character.id
      )
      this.movableArea = fillMovableArea(latLng, this.moveNum)
    } else if (isPlacable) {
      this.characters.forEach((character) => {
        if (
          this.interactCharacter &&
          this.interactCharacter.id === character.id
        )
          character.latLng = latLng
      })
      this.setModal(true)
    } else if (isInteractable) {
      this.attack()
    } else {
      this.interactCharacter = undefined
    }
  }

  attack() {
    this.onFinishBattleAction()
  }

  isMovableArea(latLng: ILatlng) {
    return !this.deployMode
      ? this.movableArea.some(
          (movable) => movable.x === latLng.x && movable.y === latLng.y
        )
      : false
  }

  onCancelBattleAction() {
    this.onFinishBattleAction(true)
  }

  onSelectBattleAction(action: ActionType) {
    if (!this.interactCharacter) return
    switch (action) {
      case 'attack':
        this.interactiveArea = fillInteractiveArea(
          this.interactCharacter.latLng,
          'closeRange'
        )
        // TODO インタラクティブタイプの実装から
        // this.interactiveType = 'attack'
        break
      case 'wait':
        break
      case 'item':
        break
    }
    this.onFinishBattleAction()
  }

  isInteractiveArea(latLng: ILatlng) {
    if (this.interactiveArea.length === 0) return false
    return this.interactiveArea.some(
      (cell) => cell.x === latLng.x && cell.y === latLng.y
    )
  }

  onFinishBattleAction(isCancel: boolean = false) {
    if (this.interactCharacter === undefined) return
    this.characters.forEach((character) => {
      if (this.interactCharacter!.id !== character.id) return
      if (isCancel) {
        character.latLng = character.lastLatLng
      } else {
        character.lastLatLng = character.latLng
      }
    })
    this.setModal(false)
    this.interactCharacter = undefined
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

  .row {
    display: flex;
  }
}
</style>
