<template>
  <div :class="$style.field" @click="finishDeployMode">
    <SideMenu
      :characters="storeCharacters"
      :selected-character-id="deployCharacterId"
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
          :cell-type="decideCellType({ x: l, y: n })"
          :character="getCharacter({ x: l, y: n })"
          :lat-lng="{ x: l, y: n }"
          @onClick="onClickCell"
        >
        </FieldCell>
      </template>
    </div>
    <Modal :is-open="isBattleModalOpen" @onClickOuter="onCancelAction">
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
const ItemBattleRoomsModule = namespace('battleRooms')

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

  @ItemBattleModule.State('characters')
  private storeCharacters!: ICharacter[]

  @ItemBattleModule.Action('bindCharactersRef')
  private bindCharactersRef!: (
    characterRef: firebase.firestore.CollectionReference<
      firebase.firestore.DocumentData
    >
  ) => Promise<null>

  @ItemBattleModule.Action('setCharacterParam')
  private setCharacterParam!: (characterObj: {
    id: string
    value: any
  }) => Promise<null>

  @ItemBattleModule.Action('updateCharacter')
  private updateCharacter!: (dbInfo: {
    battleId: string
    character: ICharacter
  }) => Promise<null>

  @ItemBattleModule.Action('updateCharacters')
  private updateCharacters!: (dbInfo: {
    battleId: string
    characters: ICharacter[]
  }) => Promise<null>

  @ItemBattleModule.Mutation('setInteractiveCharacter')
  private setInteractiveCharacter!: (cellCharacterId: string) => void

  @ItemBattleModule.Mutation('updateInteractiveCharacter')
  private updateInteractiveCharacter!: (param: any) => void

  @ItemBattleRoomsModule.Action('setBattleId')
  private setBattleId!: (userInfo: {
    uid: string
    battleId: string
  }) => Promise<null>

  @ItemBattleRoomsModule.Action('deleteBattleRoom')
  private deleteBattleRoom!: (battleId: string) => Promise<null>

  @Prop({ default: () => {} })
  characters!: ICharacter[]

  @Prop({ default: () => [] })
  deployableAreas!: IDeployableArea[]

  public deployCharacterId: string = ''
  // 素早くアクセスするためにdeployableAreaとmovableAreaはobjectで作成
  public deployableArea: { [key: string]: Boolean } = {}
  public movableArea: { [key: string]: Boolean } = {}
  public interactiveArea: ILatlng[] = []
  // TODO 各characterの移動距離と置き換える
  public moveNum = 8
  public isBattleModalOpen: boolean = false

  mounted() {
    if (this.storeUser.uid.length > 0) {
      this.onChangeStoreUser()
    }
  }

  @Watch('storeUser')
  async onChangeStoreUser() {
    // TODO エラーハンドリングはあとで考える
    if (Object.keys(this.characters).length === 0) {
      console.error(
        'charactersが空なので、オンライン対戦選択ルームから遷移してもらう'
      )
      return
    }
    if (this.storeUser.battleId.length === 0) {
      console.error('battleIdが空')
      return
    }

    const dbCharactersRef = this.$firestore.getCharactersRef(
      this.storeUser.battleId
    )
    const dbCharacters = await dbCharactersRef.get()
    if (dbCharacters.empty) {
      this.updateCharacters({
        battleId: this.storeUser.battleId,
        characters: this.characters
      })
    }
    this.bindCharactersRef(dbCharactersRef)
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
          this.onCancelAction()
        }
    }
  }

  startDeployMode(id: string) {
    this.deployableArea = fillDeployableArea(this.deployableAreas)
    this.deployCharacterId = id
  }

  // HACK デプロイ画面と戦闘画面、違う画面に分けた方がいいかもしれない
  finishDeployMode() {
    if (Object.keys(this.deployableArea).length === 0) return
    this.deployableArea = {}
    this.deployCharacterId = ''
    this.$firestore.updateCharacters(
      this.storeUser.battleId,
      this.storeCharacters
    )
  }

  deployCharacter(latLng: ILatlng, cellCharacterId: string) {
    const isDeployedCell = cellCharacterId.length > 0
    // クリックしたセルにキャラクターが存在したら、キャラクターを除外
    // 存在しないならクリックしたセルにキャラクターを配置
    const updatedLatLng = isDeployedCell ? { x: -1, y: -1 } : latLng
    const targetCharacterId = isDeployedCell
      ? cellCharacterId
      : this.deployCharacterId
    // TODO setCharacterParamはfirestoreのrefが外れてしまうため使えない
    // ただ、キャラクターを配置するたびに、firestoreを使いたくない(使用回数に制限あり)
    // どうすべきか
    // const targetCharacter = this.storeCharacters.find(
    //   (character) => character.id === targetCharacterId
    // )
    this.setCharacterParam({
      id: targetCharacterId,
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

  onSelectBattleAction(action: ActionType) {
    switch (action) {
      case 'attack':
        this.beforeInteractCharacter(action, 'closeRange')
        break
      case 'wait':
        this.onFinishAction()
        break
      case 'item':
        this.beforeInteractCharacter(action, 'closeRange', 1)
        break
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
    if (this.interactiveCharacter && cellCharacterId.length > 0) {
      switch (this.interactiveCharacter.actionState.name) {
        case 'attack':
          this.attackCharacter(cellCharacterId)
          break
        case 'item':
          this.useItem(cellCharacterId)
          break
      }
      this.onFinishAction()
    } else {
      this.onCancelAction()
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
      battleId: this.storeUser.battleId,
      character: damageTakenCharacter
    })
  }

  useItem(cellCharacterId: string) {
    console.log('item', cellCharacterId)
  }

  onCancelAction() {
    this.onFinishAction(true)
  }

  onFinishAction(isCancel: boolean = false) {
    this.setModal(false)
    this.interactiveArea = []
    this.movableArea = {}

    if (!isCancel) {
      this.applyInteractiveCharacterStore()
    }
    this.setInteractiveCharacter('')
  }

  applyInteractiveCharacterStore() {
    if (this.interactiveCharacter === undefined) return
    const defaultActionState = {
      name: '',
      itemId: 0
    } as const
    const actedCharacter = {
      ...this.interactiveCharacter,
      latLng: this.interactiveCharacter.latLng,
      lastLatLng: this.interactiveCharacter.latLng,
      actionState: defaultActionState
    }
    this.updateCharacter({
      battleId: this.storeUser.battleId,
      character: actedCharacter
    })
  }

  setModal(bool: boolean) {
    this.isBattleModalOpen = bool
  }

  // レンダリングするたびに全てのセルから呼び出されるため、可能な限り処理を軽くする
  getCharacter(latLng: ILatlng) {
    if (
      this.interactiveCharacter &&
      this.interactiveCharacter.latLng.x === latLng.x &&
      this.interactiveCharacter.latLng.y === latLng.y
    )
      return this.interactiveCharacter

    return this.storeCharacters.find((character: ICharacter) =>
      // インタラクティブなキャラクターがいる場合、同じIDのキャラクターは表示しない
      this.interactiveCharacter && this.interactiveCharacter.id === character.id
        ? false
        : character.latLng.x === latLng.x && character.latLng.y === latLng.y
    )
  }

  async onSurrender() {
    this.setBattleId({ uid: this.storeUser.uid, battleId: '' })
    await this.deleteBattleRoom(this.storeUser.battleId).catch((e) =>
      console.log(e)
    )
    this.$router.push('/battle/online')
  }

  get characterName() {
    return this.interactiveCharacter ? this.interactiveCharacter.id : ''
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
