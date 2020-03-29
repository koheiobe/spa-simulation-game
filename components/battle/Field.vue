<template>
  <div :class="$style.field" @click="finishDeployMode">
    <SideMenu
      :characters="characters"
      :selected-character-id="selectedCharacterId"
      @onClickCharacter="onClickSideMenuCharacter"
    />
    <!-- <div :class="$style.debugArea">
      <button @click="changeNormalMode">デプロイ完了</button>
      <button @click="changeDeployMode">デプロイ</button>
    </div> -->
    <div v-for="n of 100" :key="n" :class="$style.row">
      <template v-for="l of 100">
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

  public modeType: 'deploy' | 'normal' | 'move' | 'interact' = 'deploy'

  // デプロイモードプロパティ
  public deployableArea: ILatlng[] = []
  public selectedCharacterId: number = 0

  // 戦闘モードプロパティ
  // 各characterの移動距離と置き換え
  public moveNum = 8
  public movableArea: ILatlng[] = []
  public interactiveArea: ILatlng[] = []
  public interactCharacter: Character | undefined = undefined
  public isBattleDialogueOpen: boolean = false

  // changeDeployMode() {
  //   this.modeType = 'deploy'
  // }

  // changeNormalMode() {
  //   this.modeType = 'normal'
  // }

  mounted() {
    this.deployableArea = fillDeployableArea(this.deployableAreas)
  }

  isDeployableArea(latLng: ILatlng) {
    return this.modeType === 'deploy'
      ? this.deployableArea.some(
          (movable) => movable.x === latLng.x && movable.y === latLng.y
        )
      : false
  }

  onClickSideMenuCharacter(id: number) {
    this.selectedCharacterId = id
    this.modeType = 'deploy'
  }

  finishDeployMode() {
    if (this.modeType !== 'deploy') return
    this.modeType = 'normal'
    this.selectedCharacterId = 0
  }

  onClickCell(
    latLng: ILatlng,
    isDeployableCell: boolean,
    isMovableCell: boolean,
    isInteractableCell: boolean,
    characterId: number
  ) {
    // 戦闘開始前のデプロイモード
    if (this.modeType === 'deploy' && isDeployableCell) {
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

    // 通常戦闘 キャラクター選択

    if (this.modeType === 'normal' && characterId > 0) {
      this.interactCharacter = this.characters.find(
        (character) => characterId === character.id
      )
      this.movableArea = fillMovableArea(latLng, this.moveNum)
      this.modeType = 'move'
      return
    }

    // 通常戦闘 移動モード
    if (this.modeType === 'move') {
      if (isMovableCell) {
        this.characters.forEach((character) => {
          if (
            this.interactCharacter &&
            this.interactCharacter.id === character.id
          )
            character.latLng = latLng
        })
        this.setModal(true)
      } else {
        this.interactCharacter = undefined
        this.movableArea = []
        this.modeType = 'normal'
      }
      return
    }

    // 通常戦闘 インタラクトモード
    if (this.modeType === 'interact') {
      if (characterId < 0) {
        this.onCancelBattleAction()
      } else if (isInteractableCell && characterId > 0) {
        if (
          this.interactCharacter &&
          this.interactCharacter.actionState.name === 'attack'
        ) {
          // アタック処理
          console.log('attack', characterId)
        } else if (
          this.interactCharacter &&
          this.interactCharacter.actionState.name === 'item'
        ) {
          console.log('item', characterId)
        }
      }
      this.interactiveArea = []
    }
  }

  isMovableArea(latLng: ILatlng) {
    return this.modeType === 'move'
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
        this.interactCharacter.actionState = {
          name: 'attack'
        }
        this.setModal(false)
        this.modeType = 'interact'
        break
      case 'wait':
        this.onFinishBattleAction()
        this.modeType = 'normal'
        this.interactCharacter = undefined
        break
      case 'item':
        this.interactiveArea = fillInteractiveArea(
          this.interactCharacter.latLng,
          'closeRange'
        )
        this.interactCharacter.actionState = {
          name: 'item'
        }
        this.setModal(false)
        this.modeType = 'interact'
        break
    }
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
    this.modeType = 'normal'
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
