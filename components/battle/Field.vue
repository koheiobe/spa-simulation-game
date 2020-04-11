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
  @ItemUserModule.Getter('getUser')
  private storeUser!: IUser

  @ItemBattleModule.Getter('getCharacters')
  private storeCharacters!: ICharacter[]

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
  public cellCharacterId: string = ''
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
        'charactersがnullなので、オンライン対戦選択ルームから遷移してもらう'
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

  get interactiveCharacter() {
    return this.storeCharacters.find(
      (character) => this.cellCharacterId === character.id
    )
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
        this.moveCharacter(latLng)
        break
      case 'interact':
        this.interactCharacter()
        break
      default:
        // 通常戦闘モード キャラクターを選択するステージ
        if (cellCharacterId.length > 0) {
          this.cellCharacterId = cellCharacterId
          this.selectCharacter(latLng)
        } else {
          // インタラクトモードで、アクティブセル以外をクリックした時に状態をキャンセルするため
          this.onCancelBattleAction()
        }
    }
  }

  selectCharacter(latLng: ILatlng) {
    this.movableArea = fillMovableArea(latLng, this.moveNum)
  }

  deployCharacter(latLng: ILatlng, cellCharacterId: string) {
    const updatedLatLng = cellCharacterId.length > 0 ? { x: -1, y: -1 } : latLng
    const characterId =
      cellCharacterId.length > 0 ? cellCharacterId : this.selectedCharacterId
    this.$store.dispatch('battle/setCharacterParam', {
      id: characterId,
      value: {
        latLng: updatedLatLng,
        lastLatLng: updatedLatLng
      }
    })
  }

  moveCharacter(latLng: ILatlng) {
    const interactiveCharacter = this.interactiveCharacter
    if (!interactiveCharacter) return
    if (
      interactiveCharacter.id === this.cellCharacterId ||
      this.cellCharacterId.length === 0
    ) {
      this.$store.dispatch('battle/setCharacterParam', {
        id: interactiveCharacter.id,
        value: {
          latLng,
          lastLatLng: interactiveCharacter.lastLatLng
        }
      })
      this.setModal(true)
    }
    this.movableArea = {}
  }

  interactCharacter() {
    const interactiveCharacter = this.interactiveCharacter
    if (interactiveCharacter && this.cellCharacterId.length > 0) {
      if (interactiveCharacter.actionState.name === 'attack') {
        // アタック処理
        const targetCharacter = this.storeCharacters.find(
          (character) => character.id === this.cellCharacterId
        )
        if (!targetCharacter || !interactiveCharacter) return
        const damageTakenCharacter = {
          ...targetCharacter,
          hp: targetCharacter.hp - interactiveCharacter.attackPoint
        }
        this.$firestore.updateCharacter(
          this.storeUser.battleId,
          damageTakenCharacter
        )
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

  async onFinishBattleAction(isCancel: boolean = false) {
    const interactiveCharacter = this.interactiveCharacter
    if (interactiveCharacter === undefined) return
    const defaultActionState = {
      name: '',
      itemId: 0
    } as const
    const updatedLatLng = isCancel
      ? interactiveCharacter.lastLatLng
      : interactiveCharacter.latLng
    await this.$store.dispatch('battle/setCharacterParam', {
      id: interactiveCharacter.id,
      value: {
        latLng: updatedLatLng,
        lastLatLng: updatedLatLng,
        actionState: defaultActionState
      }
    })

    if (!isCancel) {
      const updatedInteractiveCharacter = this.interactiveCharacter
      if (updatedInteractiveCharacter) {
        const movedCharacter = {
          ...updatedInteractiveCharacter,
          latLng: updatedInteractiveCharacter.latLng,
          actionState: defaultActionState
        }
        this.$firestore.updateCharacter(this.storeUser.battleId, movedCharacter)
      }
    }

    this.setModal(false)
    this.resetMove()
  }

  resetMove() {
    this.cellCharacterId = ''
    this.interactiveArea = []
    this.movableArea = {}
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
    const interactiveCharacter = this.interactiveCharacter
    if (interactiveCharacter === undefined) return
    this.$store.dispatch('battle/setCharacterParam', {
      id: interactiveCharacter.id,
      value: {
        name: actionType,
        itemId
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

  onSurrender() {
    this.$firestore.setBattleId(this.storeUser.uid, '')
    this.$router.push('/battle/online')
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
