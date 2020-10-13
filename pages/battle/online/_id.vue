<template>
  <div :class="$style.container">
    <Header
      :class="$style.header"
      :store-user="storeUser"
      :battle-room="battleRoom"
      :is-my-turn="isMyTurn"
      :turn-uid="turnUid"
      :set-opponent-offline-times="setOpponentOfflineTimes"
      :set-battle-room-winner="setBattleRoomWinner"
      :is-deploy-mode-end="isDeployModeEnd"
      :is-host-or-guest="isHostOrGuest"
      :set-battle-start-at="setBattleStartAt"
      @surrender="onSurrender"
      @deploy-end="finishDeployMode"
      @turnEnd="onTurnEnd"
      @opponentOfflineThreeTimes="setBattleRoomWinner"
    />
    <Field
      :is-my-turn="isMyTurn"
      :is-my-character="isMyCharacter"
      :field="field"
      :is-host-or-guest="isHostOrGuest"
      :sync-vuex-firestore-characters="syncVuexFirestoreCharacters"
      :last-interact-character="lastInteractCharacter"
      :battle-id="battleId"
      :characters-lat-lng-map="charactersLatLngMap"
      @setcharactersLatLngMap="setcharactersLatLngMap"
      @onWin="onWin"
      @setLastInteractCharacter="setLastInteractCharacter"
    />
    <!-- 開発用 -->
    <!-- <b-button @click="toggleDeployMode"
      >deployモード: {{ isDeployModeEnd ? 'オフ' : 'オン' }}</b-button
    >-->
    <Modal :is-open="isBattleFinishModalOpen">
      <EndBattleDialogue :message="winnerMessage" :winner-name="winnerName" />
    </Modal>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { CHARACTERS, EXCEPTION_CHARACTERS_NAME } from '~/constants/characters'
import Field from '~/components/battle/Field.vue'
import { IUser, ICharacter, IBattleRoomRes } from '~/types/store'
import { ActionType, IField } from '~/types/battle'
import Modal from '~/components/utility/Modal.vue'
import EndBattleDialogue from '~/components/battle/ModalContent/endBattleDialogue.vue'
import Header from '~/components/battle/header/index.vue'
import field from '~/assets/field.json'

const UserModule = namespace('user')
const BattleRoomModule = namespace('battleRoom')
const CharacterModule = namespace('character')
const FieldModule = namespace('field')

@Component({
  components: { Field, Modal, EndBattleDialogue, Header },
  layout: 'battle'
})
export default class OnlineBattleRoom extends Vue {
  @UserModule.Getter('getUser') private storeUser!: IUser

  @CharacterModule.State('characters')
  private storeCharacters!: ICharacter[]

  @CharacterModule.Action('updateCharacters')
  private updateCharacters!: (dbInfo: {
    battleId: string
    characters: ICharacter[]
  }) => Promise<void>

  @CharacterModule.Action('bindCharactersRef')
  private bindCharactersRef!: (
    characterRef: firebase.firestore.CollectionReference<
      firebase.firestore.DocumentData
    >
  ) => Promise<firebase.firestore.DocumentData[]>

  @BattleRoomModule.State('battleRoom')
  private battleRoom!: IBattleRoomRes

  @BattleRoomModule.Action('deleteBattleRoom')
  private deleteBattleRoom!: (battleId: string) => Promise<null>

  @BattleRoomModule.Action('setUserBattleId')
  private setUserBattleId!: (userInfo: {
    uid: string
    battleId: string
  }) => Promise<null>

  @BattleRoomModule.Action('setBattleRoomWinner')
  private _setBattleRoomWinner!: (battleRoomInfo: {
    id: string
    winnerUid: string
  }) => void

  @BattleRoomModule.Action('deleteUserBattleId')
  private deleteUserBattleId!: (uid: string) => void

  @BattleRoomModule.Action('setTurnInfo')
  private setTurnInfo!: (battleRoomInfo: {
    id: string
    uid: string
    turnNumber: number
  }) => void

  @BattleRoomModule.Action('setOpponentOfflineTimes')
  public setOpponentOfflineTimes!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    offlineTimes: number
  }) => void

  @BattleRoomModule.Action('setDeployModeEnd')
  public setDeployModeEnd!: (battleRoomInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
    bool: boolean
  }) => void

  @BattleRoomModule.Action('setLastInteractCharacter')
  private setLastInteractCharacter!: (battleRoomInfo: {
    id: string
    lastInteractCharacter: ICharacter | null
  }) => {}

  @BattleRoomModule.Action('setBattleStartAt')
  private setBattleStartAt!: (battleInfo: {
    id: string
    hostOrGuest: 'host' | 'guest'
  }) => {}

  @BattleRoomModule.Action('unBindBattleRoomRef')
  private unBindBattleRoomRef!: () => void

  @FieldModule.Mutation('startDeployMode')
  private startDeployMode!: (isHostOrGuest: string) => void

  // TODO: finishDeployModeの関数名がかぶっているため大文字に。storeで処理をまとめる
  @FieldModule.Mutation('finishDeployMode')
  private FinishDeployMode!: () => void

  @FieldModule.Getter('isDeploying')
  private isDeploying!: () => boolean

  public charactersLatLngMap: IField = {}

  public battleId: string = ''
  public winnerName: string = ''
  public isBattleFinishModalOpen: boolean = false
  // TODO: プレイヤーが変更 or ランダムで選択できるようにする
  public field = field
  public battleStartAt: number = 0
  public winnerMessage = ''

  async created() {
    this.battleId = this.$route.params.id
    // 対戦者以外は戦闘が見れない
    if (
      this.storeUser.uid !== this.battleRoom.host.uid &&
      this.storeUser.uid !== this.battleRoom.guest.uid
    ) {
      this.$router.push('/battle/online')
      return
    }

    if (!this.isDeployModeEnd) {
      this.startDeployMode(this.isHostOrGuest)
    }

    const characters =
      this.battleRoom.turn.number === 0
        ? // TODO: キャラクターの登録方法は戦闘開始前に行う予定だが、詳細は未定
          await this.initCharacters()
        : await this.syncVuexFirestoreCharacters(this.battleId)

    if (characters) {
      this.initCharactersLatLngMap(characters)
    }
    // ウィンドウを閉じる時に注意を表示
    window.addEventListener('beforeunload', function(e) {
      e.preventDefault()
    })
    this.preventHistoryBack()
  }

  destroyed() {
    this.deleteBattleRoom(this.battleId).catch((e) =>
      // TODO: エラーハンドリングはあとで考える
      console.error('battleRoomの削除に失敗しました。', e)
    )
    this.deleteUserBattleId(this.storeUser.uid)
  }

  async initCharacters() {
    const firestoreCharacters = await this.syncVuexFirestoreCharacters(
      this.battleId
    )

    if (
      firestoreCharacters.some((character) =>
        this.isMyCharacter(character as ICharacter)
      )
    )
      return firestoreCharacters

    const characterList = CHARACTERS as { [name: string]: ICharacter }
    const characters = [] as ICharacter[]
    const hostOrGuest = this.isHostOrGuest
    Object.keys(characterList).forEach((key) => {
      characters.push({
        ...characterList[key],
        id: characterList[key].id + '-' + hostOrGuest
      })
    })
    const randomCharacters = this.getRandomCharacters(characters)

    this.updateCharacters({
      battleId: this.battleId,
      characters: randomCharacters
    })
    return randomCharacters
  }

  syncVuexFirestoreCharacters(battleId: string) {
    const dbCharactersRef = this.$firestore.getCharactersRef(battleId)
    return this.bindCharactersRef(dbCharactersRef)
  }

  async finishDeployMode() {
    if (!this.isDeploying) return
    this.FinishDeployMode()
    await this.updateCharacters({
      battleId: this.battleId,
      // 敵キャラクターまで初期化すると、ローカルに存在する敵キャラクターのデータで
      // 敵がすでに変更したfirestore上の敵キャラクターデータを上書きしてしまうためfilterする
      characters: this.storeCharacters.filter((character) =>
        this.isMyCharacter(character)
      )
    })
    const characters = await this.syncVuexFirestoreCharacters(this.battleId)
    this.initCharactersLatLngMap(characters)
    // Field.vueのdeployCharacterのthis.setCharacterParamをすると
    // vuexとfirestoreの参照が外れるため再度、同期させる必要がある
    this.setDeployModeEnd({
      id: this.battleId,
      hostOrGuest: this.isHostOrGuest,
      bool: true
    })
  }

  startBattle() {
    // TODO: どっちが先行なのか、どうやって決めるかは未定
    const turnNumber = this.battleRoom.turn.number
    this.setTurnInfo({
      id: this.battleId,
      uid: this.storeUser.uid,
      turnNumber: turnNumber === 0 ? 1 : turnNumber
    })
  }

  onTurnStart() {
    const initActionStatesCharacter = this.storeCharacters.map((character) => ({
      ...character,
      actionState: {
        ...character.actionState,
        name: '' as ActionType,
        isEnd: false
      }
    }))
    this.updateCharacters({
      battleId: this.battleId,
      characters: initActionStatesCharacter
    })
    this.initCharactersLatLngMap(this.storeCharacters)
  }

  onTurnEnd() {
    const nextTurnUid =
      this.battleRoom.turn.uid === this.battleRoom.host.uid
        ? this.battleRoom.guest.uid
        : this.battleRoom.host.uid
    const nextTurnNumber = this.battleRoom.turn.number + 1
    this.setTurnInfo({
      id: this.battleId,
      uid: nextTurnUid,
      turnNumber: nextTurnNumber
    })
  }

  setBattleRoomWinner(battleRoomInfo: {
    id: string
    winnerUid: string
    message?: string
  }) {
    const { message, id, winnerUid } = battleRoomInfo
    this.winnerMessage = message || ''
    this._setBattleRoomWinner({
      id,
      winnerUid
    })
  }

  onSurrender() {
    const opponentUid =
      this.battleRoom.host.uid === this.storeUser.uid
        ? this.battleRoom.guest.uid
        : this.battleRoom.host.uid
    this._setBattleRoomWinner({
      id: this.battleId,
      winnerUid: opponentUid
    })
  }

  onWin() {
    this._setBattleRoomWinner({
      id: this.battleId,
      winnerUid: this.storeUser.uid
    })
  }

  onDecideWinner() {
    if (this.isBattleFinishModalOpen) return
    this.isBattleFinishModalOpen = true
    this.winnerName =
      this.battleRoom.host.uid === this.battleRoom.winnerUid
        ? this.battleRoom.host.name
        : this.battleRoom.guest.name

    // ホストかゲスト、どちらか先に退出してfirestoreのデータを削除すると
    // 残されたクライアント側でエラーが発生するため、同期を中止する
    this.unBindBattleRoomRef()
    window.setTimeout(() => this.$router.push('/battle/online'), 5000)
  }

  isMyCharacter(character: ICharacter | undefined) {
    if (!character) return false
    const matchedSuffix = character.id.match(/-.+()$/)
    if (!matchedSuffix) return false
    return matchedSuffix[0].replace('-', '') === this.isHostOrGuest
  }

  initCharactersLatLngMap(characters: firebase.firestore.DocumentData[]) {
    this.charactersLatLngMap = characters.reduce((acum, cur) => {
      if (!this.isMyCharacter(cur as ICharacter) && cur.latLng.x > 0) {
        acum[`${cur.latLng.y}_${cur.latLng.x}`] = {
          type: 'character'
        }
      }
      return acum
    }, {})
  }

  setcharactersLatLngMap(character: ICharacter) {
    if (this.isMyCharacter(character)) return
    const { lastLatLng, latLng } = character
    delete this.charactersLatLngMap[`${lastLatLng.y}_${lastLatLng.x}`]
    if (latLng.x > 0) {
      this.charactersLatLngMap[`${latLng.y}_${latLng.x}`] = {
        type: 'character'
      }
    }
  }

  CAHARACTERS_NUM = 25
  getRandomCharacters(characters: ICharacter[]) {
    const randomCharacters: ICharacter[] = []
    while (randomCharacters.length < this.CAHARACTERS_NUM) {
      const index = Math.floor((Math.random() * 100) % characters.length)
      const character = characters[index]
      if (
        randomCharacters.includes(character) ||
        EXCEPTION_CHARACTERS_NAME.includes(character.name)
      ) {
        continue
      } else {
        randomCharacters.push(characters[index])
      }
    }
    return randomCharacters
  }

  preventHistoryBack() {
    history.pushState(null, '', location.href)
    window.addEventListener('popstate', (_) => {
      history.go(1)
    })
  }

  @Watch('battleRoom')
  onChangeIsDeployModeEnd(battleRoom: IBattleRoomRes) {
    if (
      battleRoom.turn.number === 0 &&
      battleRoom.host.isDeployModeEnd &&
      battleRoom.guest.isDeployModeEnd
    ) {
      this.startBattle()
    }
  }

  @Watch('winnerUid')
  onChangeWinnerUid() {
    this.onDecideWinner()
  }

  @Watch('turnUid')
  onChangeTurn(turnUid: string) {
    if (turnUid === '' || !this.isMyTurn) return

    this.onTurnStart()
  }

  // 開発用
  toggleDeployMode() {
    if (this.isDeployModeEnd) {
      this.startDeployMode(this.isHostOrGuest)
      // この機能を使用する場合、components/header/deployの
      // setBattleRoomWinner を削除する必要がある
      this.setDeployModeEnd({
        id: this.battleId,
        hostOrGuest: this.isHostOrGuest,
        bool: false
      })
    } else {
      this.finishDeployMode()
    }
  }

  get isMyTurn() {
    return this.battleRoom.turn.uid === this.storeUser.uid
  }

  get winnerUid() {
    return this.battleRoom.winnerUid
  }

  // TODO: Header側のturn機能をこのファイルに移植する
  get turnUid() {
    return this.battleRoom.turn.uid
  }

  get lastInteractCharacter() {
    return this.battleRoom.lastInteractCharacter
  }

  get isHostOrGuest() {
    return this.battleRoom.host.uid === this.storeUser.uid ? 'host' : 'guest'
  }

  get isDeployModeEnd() {
    return this.isHostOrGuest === 'host'
      ? this.battleRoom.host.isDeployModeEnd
      : this.battleRoom.guest.isDeployModeEnd
  }
}
</script>

<style lang="scss" module>
.container {
  position: relative;

  .header {
    position: fixed;
    right: 0;
    top: 0;
  }
}
</style>
